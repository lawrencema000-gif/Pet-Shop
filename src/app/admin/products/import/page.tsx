"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, FileSpreadsheet, CheckCircle, XCircle,
  AlertTriangle, Download, Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

interface ParsedRow {
  name: string;
  price: number;
  compare_price: number | null;
  category: string;
  status: string;
  description: string;
  stock: number;
  sku: string;
  image_url: string;
  error?: string;
}

interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const TEMPLATE_HEADERS = "name,price,compare_price,category,status,description,stock,sku,image_url";
const TEMPLATE_EXAMPLE = `"Granary Smart Feeder",89.99,119.99,"Smart Feeders",active,"Automatic pet feeder with camera",50,PLB-GF001,https://example.com/feeder.jpg
"Water Fountain Pro",49.99,,,"draft","Stainless steel water fountain",100,PLB-WF002,`;

export default function BulkImportPage() {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("display_order").then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  function downloadTemplate() {
    const csv = TEMPLATE_HEADERS + "\n" + TEMPLATE_EXAMPLE;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): ParsedRow[] {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

    const nameIdx = headers.indexOf("name");
    const priceIdx = headers.indexOf("price");
    const comparePriceIdx = headers.indexOf("compare_price");
    const categoryIdx = headers.indexOf("category");
    const statusIdx = headers.indexOf("status");
    const descIdx = headers.indexOf("description");
    const stockIdx = headers.indexOf("stock");
    const skuIdx = headers.indexOf("sku");
    const imageIdx = headers.indexOf("image_url");

    if (nameIdx === -1 || priceIdx === -1) {
      return [{ name: "", price: 0, compare_price: null, category: "", status: "", description: "", stock: 0, sku: "", image_url: "", error: "CSV must have 'name' and 'price' columns" }];
    }

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 0) continue;

      const name = cols[nameIdx]?.trim() ?? "";
      const price = parseFloat(cols[priceIdx]) || 0;

      if (!name) {
        parsed.push({ name: "", price: 0, compare_price: null, category: "", status: "", description: "", stock: 0, sku: "", image_url: "", error: `Row ${i + 1}: Missing product name` });
        continue;
      }
      if (price <= 0) {
        parsed.push({ name, price: 0, compare_price: null, category: "", status: "", description: "", stock: 0, sku: "", image_url: "", error: `Row ${i + 1}: Invalid price for "${name}"` });
        continue;
      }

      parsed.push({
        name,
        price,
        compare_price: comparePriceIdx >= 0 ? (parseFloat(cols[comparePriceIdx]) || null) : null,
        category: categoryIdx >= 0 ? (cols[categoryIdx]?.trim() ?? "") : "",
        status: statusIdx >= 0 ? (cols[statusIdx]?.trim() || "draft") : "draft",
        description: descIdx >= 0 ? (cols[descIdx]?.trim() ?? "") : "",
        stock: stockIdx >= 0 ? (parseInt(cols[stockIdx]) || 0) : 0,
        sku: skuIdx >= 0 ? (cols[skuIdx]?.trim() ?? "") : "",
        image_url: imageIdx >= 0 ? (cols[imageIdx]?.trim() ?? "") : "",
      });
    }

    return parsed;
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setStep("importing");
    const validRows = rows.filter((r) => !r.error);
    const catMap = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

    const created: string[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      setProgress(Math.round(((i + 1) / validRows.length) * 100));

      // Check for duplicate slug
      const slug = slugify(row.name);
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        skipped++;
        errors.push(`"${row.name}" — slug "${slug}" already exists, skipped`);
        continue;
      }

      // Resolve category
      const categoryId = row.category ? (catMap.get(row.category.toLowerCase()) ?? null) : null;

      // Insert product
      const { data: prod, error: prodErr } = await supabase
        .from("products")
        .insert({
          name: row.name,
          slug,
          description: row.description || null,
          category_id: categoryId,
          base_price: row.price,
          compare_at_price: row.compare_price,
          status: ["draft", "active", "archived"].includes(row.status) ? row.status : "draft",
          is_new: true,
        })
        .select("id")
        .single();

      if (prodErr) {
        errors.push(`"${row.name}" — ${prodErr.message}`);
        continue;
      }

      // Create default variant
      await supabase.from("product_variants").insert({
        product_id: prod.id,
        name: "Default",
        variant_type: "style",
        price: row.price,
        stock_quantity: Math.max(0, row.stock),
        sku: row.sku || null,
        is_default: true,
      });

      // Add image if provided
      if (row.image_url) {
        await supabase.from("product_images").insert({
          product_id: prod.id,
          url: row.image_url,
          display_order: 0,
          is_primary: true,
        });
      }

      // Log stock movement
      if (row.stock > 0) {
        await supabase.from("stock_movements").insert({
          product_id: prod.id,
          movement_type: "initial",
          quantity: row.stock,
          stock_after: row.stock,
          reference_type: "csv_import",
          notes: "Initial stock from CSV import",
        });
      }

      created.push(prod.id);
    }

    if (created.length > 0) {
      await logAdminAction("csv_product_import", "product", undefined, {
        created: created.length,
        skipped,
        errors: errors.length,
      });
    }

    setResult({ created: created.length, skipped, errors });
    setStep("done");
  }

  const validCount = rows.filter((r) => !r.error).length;
  const errorCount = rows.filter((r) => r.error).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Bulk Import Products</h1>
          <p className="text-sm text-muted mt-1">Upload a CSV file to create multiple products at once</p>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="max-w-2xl">
          <div className="bg-white border border-border rounded-lg p-8">
            <div className="text-center mb-6">
              <FileSpreadsheet size={40} className="mx-auto text-muted mb-3" />
              <h2 className="text-lg font-semibold text-foreground">Upload CSV File</h2>
              <p className="text-sm text-muted mt-1">
                Required columns: <code className="bg-surface px-1 rounded text-xs">name</code>, <code className="bg-surface px-1 rounded text-xs">price</code>
              </p>
              <p className="text-xs text-muted mt-1">
                Optional: compare_price, category, status, description, stock, sku, image_url
              </p>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/40 transition-colors"
            >
              <p className="text-sm text-muted mb-3">Drag & drop your CSV file here, or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
              >
                <Upload size={14} /> Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <button onClick={downloadTemplate} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
                <Download size={14} /> Download template CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-foreground font-medium">{rows.length} rows parsed</span>
              {validCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> {validCount} valid
                </span>
              )}
              {errorCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-sale bg-sale/10 px-2 py-0.5 rounded-full">
                  <XCircle size={10} /> {errorCount} errors
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep("upload"); setRows([]); }} className="px-3 py-2 text-sm border border-border rounded-md hover:bg-surface">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60"
              >
                <Upload size={14} /> Import {validCount} Products
              </button>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase w-8">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">Name</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">Price</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">Category</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">Stock</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase">SKU</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${row.error ? "bg-sale/5" : ""}`}>
                    <td className="px-3 py-2 text-xs text-muted">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{row.name || "—"}</td>
                    <td className="px-3 py-2">{row.price > 0 ? `$${row.price.toFixed(2)}` : "—"}</td>
                    <td className="px-3 py-2 text-muted">{row.category || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        row.status === "active" ? "bg-success/10 text-success" : "bg-surface text-muted"
                      }`}>
                        {row.status || "draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{row.stock}</td>
                    <td className="px-3 py-2 text-xs font-mono text-muted">{row.sku || "—"}</td>
                    <td className="px-3 py-2">
                      {row.error ? (
                        <span title={row.error}><AlertTriangle size={14} className="text-sale" /></span>
                      ) : (
                        <CheckCircle size={14} className="text-success" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errorCount > 0 && (
            <div className="mt-4 bg-sale/5 border border-sale/20 rounded-lg p-4">
              <p className="text-sm font-medium text-sale mb-2">Errors ({errorCount})</p>
              <ul className="text-xs text-sale space-y-1">
                {rows.filter((r) => r.error).map((r, i) => (
                  <li key={i}>{r.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Importing */}
      {step === "importing" && (
        <div className="max-w-md mx-auto text-center py-12">
          <Loader2 size={32} className="mx-auto text-accent animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Importing Products...</h2>
          <p className="text-sm text-muted mt-1">{progress}% complete</p>
          <div className="w-full bg-surface rounded-full h-2 mt-4">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && result && (
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="bg-white border border-border rounded-lg p-8">
            <CheckCircle size={40} className="mx-auto text-success mb-4" />
            <h2 className="text-lg font-semibold text-foreground">Import Complete</h2>

            <div className="flex justify-center gap-6 mt-6 mb-6">
              <div>
                <p className="text-2xl font-bold text-success">{result.created}</p>
                <p className="text-xs text-muted">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                <p className="text-xs text-muted">Skipped</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sale">{result.errors.length}</p>
                <p className="text-xs text-muted">Errors</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="text-left bg-surface/50 rounded-md p-3 mb-6 max-h-40 overflow-y-auto">
                <ul className="text-xs text-muted space-y-1">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
              >
                View Products
              </Link>
              <button
                onClick={() => { setStep("upload"); setRows([]); setResult(null); setProgress(0); }}
                className="px-4 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface"
              >
                Import More
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

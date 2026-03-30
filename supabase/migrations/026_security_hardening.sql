-- 026: Security hardening — role escalation prevention (ported from YIWU)

-- A. is_super_admin() function — checks email whitelist
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_emails jsonb;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN false; END IF;

  SELECT value INTO v_emails FROM public.app_settings WHERE key = 'super_admin_emails';
  IF v_emails IS NULL THEN RETURN false; END IF;

  RETURN v_emails @> to_jsonb(v_email);
END;
$$;

-- B. Prevent role escalation trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_super boolean;
BEGIN
  -- Skip if role and staff_role_id unchanged
  IF OLD.role IS NOT DISTINCT FROM NEW.role
     AND OLD.staff_role_id IS NOT DISTINCT FROM NEW.staff_role_id THEN
    RETURN NEW;
  END IF;

  SELECT public.is_super_admin() INTO v_is_super;

  IF NOT v_is_super THEN
    NEW.role := OLD.role;
    NEW.staff_role_id := OLD.staff_role_id;
  END IF;

  -- Super admins cannot demote themselves
  IF v_is_super AND OLD.id = auth.uid() AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Super admins cannot demote themselves';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- C. Enforce customer role on new signups
CREATE OR REPLACE FUNCTION public.enforce_customer_role_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    NEW.role := 'customer';
    NEW.staff_role_id := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_customer_role ON profiles;
CREATE TRIGGER trg_enforce_customer_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_customer_role_on_insert();

-- D. Protect sensitive app_settings keys
CREATE OR REPLACE FUNCTION public.protect_sensitive_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sensitive_keys text[] := ARRAY[
    'super_admin_emails',
    'stripe_secret_key',
    'stripe_webhook_secret'
  ];
BEGIN
  IF NEW.key = ANY(v_sensitive_keys) THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Only super admins can modify sensitive settings: %', NEW.key;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_sensitive_settings ON app_settings;
CREATE TRIGGER trg_protect_sensitive_settings
  BEFORE INSERT OR UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION protect_sensitive_settings();

-- E. Seed super_admin_emails BEFORE trigger (must exist for is_super_admin to work)
-- Temporarily disable trigger for seeding
ALTER TABLE app_settings DISABLE TRIGGER trg_protect_sensitive_settings;

INSERT INTO app_settings (key, value)
VALUES ('super_admin_emails', '["lawrence.ma000@gmail.com"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE app_settings ENABLE TRIGGER trg_protect_sensitive_settings;

NOTIFY pgrst, 'reload schema';

BEGIN;
SET LOCAL role authenticated;
SET LOCAL request.jwt.claims = '{"sub": "831a8311-ffff-497d-9ba9-4b78446842b9"}';

INSERT INTO public.customers (name, type, location, owner_id)
VALUES ('Test Customer', 'Retail', 'Test City', 'dc124904-c8e6-4b25-bf88-4e28cf1a41e2');

SELECT id, name, owner_id, org_id FROM public.customers;
ROLLBACK;

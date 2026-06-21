begin;
select plan(3);

-- 1. Test Tables Exist
select has_table('public', 'distributors', 'distributors table should exist');
select has_table('public', 'super_stockists', 'super_stockists table should exist');
select has_table('public', 'inventory_ledger', 'inventory_ledger table should exist');

select * from finish();
rollback;

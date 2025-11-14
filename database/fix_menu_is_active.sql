-- Business Menu Fix - is_active kontrol ve düzeltme

-- Mevcut kategorilerin is_active durumunu kontrol et
SELECT 
  id, 
  business_id, 
  name, 
  is_active,
  CASE WHEN is_active IS NULL THEN 'NULL!' ELSE 'OK' END as status
FROM business_menu_categories;

-- Mevcut ürünlerin is_active durumunu kontrol et  
SELECT 
  id, 
  business_id,
  category_id,
  name, 
  is_active,
  CASE WHEN is_active IS NULL THEN 'NULL!' ELSE 'OK' END as status
FROM business_menu_items;

-- NULL olan is_active'leri true yap (eğer varsa)
UPDATE business_menu_categories 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE business_menu_items 
SET is_active = true 
WHERE is_active IS NULL;

-- Sonuç kontrol
SELECT 
  'Kategoriler' as tablo,
  COUNT(*) as toplam,
  COUNT(CASE WHEN is_active = true THEN 1 END) as aktif,
  COUNT(CASE WHEN is_active = false THEN 1 END) as pasif,
  COUNT(CASE WHEN is_active IS NULL THEN 1 END) as null_olan
FROM business_menu_categories

UNION ALL

SELECT 
  'Ürünler' as tablo,
  COUNT(*) as toplam,
  COUNT(CASE WHEN is_active = true THEN 1 END) as aktif,
  COUNT(CASE WHEN is_active = false THEN 1 END) as pasif,
  COUNT(CASE WHEN is_active IS NULL THEN 1 END) as null_olan
FROM business_menu_items;

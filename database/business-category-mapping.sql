-- Business Type → City-V Category Mapping

-- Business type'dan category'ye otomatik mapping
CREATE OR REPLACE FUNCTION map_business_type_to_category(business_type TEXT)
RETURNS VARCHAR AS $$
BEGIN
  RETURN CASE 
    -- Yemek & İçecek
    WHEN business_type IN ('restaurant', 'restoran', 'lokanta') THEN 'restaurant'
    WHEN business_type IN ('cafe', 'kahve', 'coffee') THEN 'cafe'
    WHEN business_type IN ('bar', 'pub') THEN 'bar'
    WHEN business_type IN ('fastfood', 'fast_food') THEN 'fastfood'
    
    -- Alışveriş
    WHEN business_type IN ('retail', 'mağaza', 'dükkan', 'store') THEN 'shopping'
    WHEN business_type IN ('market', 'supermarket', 'grocery') THEN 'shopping'
    WHEN business_type IN ('mall', 'avm', 'shopping_center') THEN 'shopping'
    
    -- Sağlık
    WHEN business_type IN ('hospital', 'hastane', 'clinic', 'klinik') THEN 'hospital'
    WHEN business_type IN ('pharmacy', 'eczane') THEN 'pharmacy'
    WHEN business_type IN ('dentist', 'diş', 'dental') THEN 'hospital'
    
    -- Finans
    WHEN business_type IN ('bank', 'banka') THEN 'bank'
    WHEN business_type IN ('atm') THEN 'atm'
    
    -- Hizmetler
    WHEN business_type IN ('notary', 'noter') THEN 'notary'
    WHEN business_type IN ('hotel', 'otel', 'accommodation') THEN 'hotel'
    WHEN business_type IN ('gym', 'fitness', 'spor') THEN 'gym'
    WHEN business_type IN ('beauty', 'kuaför', 'salon') THEN 'beauty'
    
    -- Eğlence & Kültür
    WHEN business_type IN ('cinema', 'sinema', 'movie') THEN 'entertainment'
    WHEN business_type IN ('museum', 'müze') THEN 'museum'
    WHEN business_type IN ('park', 'bahçe', 'garden') THEN 'park'
    
    -- Ulaşım
    WHEN business_type IN ('gas_station', 'benzin', 'petrol') THEN 'gas'
    WHEN business_type IN ('parking', 'otopark') THEN 'parking'
    
    -- Diğer
    ELSE 'other'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger - Business type değişince category'yi otomatik güncelle
CREATE OR REPLACE FUNCTION auto_update_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_type IS NOT NULL AND (NEW.category IS NULL OR NEW.category = 'other') THEN
    NEW.category := map_business_type_to_category(NEW.business_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_category ON business_profiles;
CREATE TRIGGER trigger_auto_category
BEFORE INSERT OR UPDATE ON business_profiles
FOR EACH ROW
EXECUTE FUNCTION auto_update_category();

-- Mevcut kayıtlar için category güncelle
UPDATE business_profiles 
SET category = map_business_type_to_category(business_type)
WHERE business_type IS NOT NULL AND (category IS NULL OR category = 'other');

SELECT '✅ Business type → category mapping aktif' as result;

// Temp - handleRequestPermission fonksiyonu düzeltilmiş hali
const handleRequestPermission = async () => {
  setShowLocationBanner(false);
  
  // Filtreleri temizle
  useFilterStore.getState().clearFilters();
  console.log('Filtreler temizlendi');
  
  console.log('Konum izni isteniyor...');
  await requestUserLocation();
  const { userLocation: newLocation } = useLocationStore.getState();
  
  console.log('Konum alindi:', newLocation);
  
  if (newLocation) {
    setMapCenter(newLocation);
    setMapZoom(13);
    console.log('Harita merkezi guncellendi - Business locations API den yukleniyor');
  } else {
    console.error('Konum alinamadi!');
  }
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    if (user?.tenantId) {
      setTenant(user.tenantId);
      // Fetch brands
      // setBrands(user.brands || []);
      // if (user.brands?.length) {
      //   setSelectedBrand(user.brands[0]);
      // }
    }
  }, [user]);

  const switchBrand = (brandId) => {
    const brand = brands.find(b => b._id === brandId);
    if (brand) {
      setSelectedBrand(brand);
      localStorage.setItem('selectedBrandId', brandId);
    }
  };

  const value = {
    tenant,
    brands,
    selectedBrand,
    switchBrand,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

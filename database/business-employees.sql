-- Business Personel Yönetim Sistemi

CREATE TABLE IF NOT EXISTS business_employees (
    id SERIAL PRIMARY KEY,
    business_user_id INTEGER NOT NULL REFERENCES business_users(id) ON DELETE CASCADE,
    
    -- Kişisel Bilgiler
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    photo_url TEXT,
    
    -- İş Bilgileri
    position VARCHAR(255) NOT NULL, -- Kasiyer, Güvenlik, Müdür, vb.
    department VARCHAR(255), -- Satış, İdari, Teknik, vb.
    employee_id VARCHAR(100) UNIQUE, -- Çalışan numarası
    start_date DATE,
    salary DECIMAL(10, 2),
    
    -- Vardiya ve Çalışma
    shift VARCHAR(50), -- 'morning', 'afternoon', 'night', 'flexible'
    working_hours JSONB, -- { "monday": "09:00-18:00", "tuesday": "09:00-18:00", ... }
    is_active BOOLEAN DEFAULT true,
    
    -- Yetki ve Erişim
    access_level VARCHAR(50) DEFAULT 'employee', -- 'admin', 'manager', 'employee'
    can_access_analytics BOOLEAN DEFAULT false,
    can_manage_cameras BOOLEAN DEFAULT false,
    
    -- Notlar
    notes TEXT,
    emergency_contact TEXT,
    
    -- Tarihler
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_employees_user ON business_employees(business_user_id);
CREATE INDEX IF NOT EXISTS idx_business_employees_position ON business_employees(position);
CREATE INDEX IF NOT EXISTS idx_business_employees_active ON business_employees(is_active);

-- Update trigger
CREATE OR REPLACE FUNCTION update_business_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_employees_updated_at
    BEFORE UPDATE ON business_employees
    FOR EACH ROW
    EXECUTE FUNCTION update_business_employees_updated_at();

-- Demo data
INSERT INTO business_employees (business_user_id, full_name, email, phone, position, department, shift, is_active)
VALUES 
    (1, 'Ahmet Yılmaz', 'ahmet@business.com', '0532 111 22 33', 'Kasiyer', 'Satış', 'morning', true),
    (1, 'Ayşe Demir', 'ayse@business.com', '0532 222 33 44', 'Müdür', 'Yönetim', 'flexible', true),
    (1, 'Mehmet Kaya', 'mehmet@business.com', '0532 333 44 55', 'Güvenlik', 'Güvenlik', 'night', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE business_employees IS 'Business kullanıcılarının personel yönetim sistemi';
COMMENT ON COLUMN business_employees.working_hours IS 'Haftalık çalışma saatleri JSON formatında';
COMMENT ON COLUMN business_employees.access_level IS 'admin: Tüm yetki, manager: Yönetim yetkisi, employee: Sınırlı erişim';

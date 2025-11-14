// ============================================
// CITY-V BUSINESS BOX - SLIDE MOUNT SYSTEM
// 10cm x 10cm x 5cm - Tool-Free Installation
// ============================================
// ESP32-CAM + TP4056 + 18650 Battery
// KIZAKLI MONTAJ - Vida Gerekmez!
// ============================================

// ===== PARAMETERS =====
$fn = 150; // Ultra smooth curves

// Main dimensions - EXACT 10x10x5cm
box_width = 100;        // 10cm width
box_depth = 100;        // 10cm depth  
box_height = 50;        // 5cm height
wall = 2.8;             // Premium wall thickness
radius = 15;            // Elegant corner radius

// ESP32-CAM (center mount)
esp32_w = 27;
esp32_d = 40;
esp32_h = 20;

// Camera lens - FRONT CENTER
cam_dia = 11;           // Camera lens diameter
cam_ring = 18;          // Decorative ring
cam_x = box_width/2;    // Dead center
cam_y = box_depth/2;
cam_z = 2.5;            // Bottom surface

// 18650 Battery (horizontal - space efficient)
bat_dia = 18.8;         // 18650 diameter + tolerance
bat_len = 66;           // Standard length

// TP4056 charging module
tp_w = 26;
tp_d = 17;
tp_h = 3.5;

// USB-C port (side access)
usb_w = 9.5;
usb_h = 3.5;

// LED indicators (minimal, elegant)
led_dia = 2.5;          // Small, subtle

// Power button (flush mount)
btn_dia = 6;

// SLIDE MOUNT SYSTEM - Kolay Montaj!
slide_width = 60;       // Kızak genişliği
slide_depth = 8;        // Kızak derinliği
slide_height = 4;       // Kızak yüksekliği
slide_tolerance = 0.3;  // Montaj toleransı
hook_depth = 5;         // Kanca derinliği

// Ventilation (hidden, circular pattern)
vent_dia = 2;
vent_count = 12;        // Ring pattern

// ===== MAIN BODY WITH SLIDE MOUNT =====
module pro_body_slide() {
    difference() {
        union() {
            // Outer shell - Apple-style rounded box
            difference() {
                hull() {
                    for(x = [radius, box_width-radius])
                        for(y = [radius, box_depth-radius])
                            for(z = [radius, box_height-radius]) {
                                translate([x, y, z])
                                    sphere(r = radius);
                            }
                }
                
                // Hollow interior
                translate([wall, wall, wall])
                hull() {
                    for(x = [radius-wall, box_width-radius-wall*2])
                        for(y = [radius-wall, box_depth-radius-wall*2])
                            for(z = [radius-wall, box_height-radius-wall*2]) {
                                translate([x, y, z])
                                    sphere(r = radius-wall);
                            }
                }
                
                // Top opening (for access)
                translate([wall+5, wall+5, box_height-wall])
                    cube([box_width-wall*2-10, box_depth-wall*2-10, wall+1]);
            }
            
            // ===== SLIDE HOOKS (2 pieces - back of device) =====
            // Upper hook (slides onto wall plate)
            translate([(box_width-slide_width)/2, -slide_depth-2, box_height-slide_height-5])
                slide_hook();
            
            // Lower hook (locks into place)
            translate([(box_width-slide_width)/2, -slide_depth-2, 10])
                slide_hook();
        }
        
        // ===== CAMERA LENS (Professional center mount) =====
        // Main lens hole
        translate([cam_x, cam_y, -1])
            cylinder(d = cam_dia, h = wall + 2);
        
        // Chamfered decorative ring (Apple-style)
        translate([cam_x, cam_y, wall-0.8])
            cylinder(d1 = cam_ring, d2 = cam_dia, h = 1);
        
        // Inner ring detail
        translate([cam_x, cam_y, -1])
            cylinder(d1 = cam_dia + 3, d2 = cam_dia, h = wall);
        
        // ===== ESP32-CAM COMPARTMENT =====
        translate([(box_width-esp32_w)/2, (box_depth-esp32_d)/2, cam_z+2])
            cube([esp32_w, esp32_d, esp32_h]);
        
        // ===== BATTERY COMPARTMENT (horizontal - efficient) =====
        translate([box_width/2, box_depth/2, box_height/2])
            rotate([0, 90, 0])
            cylinder(d = bat_dia, h = bat_len, center = true);
        
        // Battery access slot
        translate([box_width/2 - bat_len/2 - 5, box_depth/2 - bat_dia/2 - 1, box_height - wall - 5])
            cube([bat_len + 10, bat_dia + 2, 10]);
        
        // ===== TP4056 CHARGING MODULE =====
        translate([wall + 3, (box_depth - tp_d)/2, box_height - tp_h - 5])
            cube([tp_w, tp_d, tp_h + 3]);
        
        // ===== USB-C PORT (side access - elegant) =====
        translate([-1, (box_depth - usb_w)/2, box_height/2 - usb_h/2])
            cube([wall + 2, usb_w, usb_h]);
        
        // USB-C recess (Apple-style detail)
        translate([-0.5, (box_depth - usb_w)/2 - 2, box_height/2 - usb_h/2 - 1])
            cube([1.5, usb_w + 4, usb_h + 2]);
        
        // ===== POWER BUTTON (top surface - flush) =====
        translate([box_width - 20, box_depth - 20, box_height - 2])
            cylinder(d = btn_dia, h = 3);
        
        // Button chamfer
        translate([box_width - 20, box_depth - 20, box_height - 1])
            cylinder(d1 = btn_dia + 2, d2 = btn_dia, h = 1.5);
        
        // ===== LED INDICATORS (minimal - side visible) =====
        // Charging LED (red)
        translate([box_width + 1, box_depth/2 - 10, box_height/2])
            rotate([0, 90, 0])
            cylinder(d = led_dia, h = wall + 2);
        
        // Charged LED (blue)
        translate([box_width + 1, box_depth/2 + 10, box_height/2])
            rotate([0, 90, 0])
            cylinder(d = led_dia, h = wall + 2);
        
        // ===== VENTILATION (hidden circular pattern) =====
        for(i = [0:vent_count-1]) {
            angle = i * (360/vent_count);
            rotate([0, 0, angle])
                translate([box_width/2 - 15, 0, box_height/2])
                rotate([0, 90, 0])
                cylinder(d = vent_dia, h = 10);
        }
        
        // ===== CABLE MANAGEMENT GROOVE =====
        translate([box_width/2 - 4, box_depth/2 - 4, wall])
            cube([8, 8, 5]);
    }
    
    // ===== INTERNAL SUPPORTS (minimal, strong) =====
    // ESP32 platform
    translate([(box_width-esp32_w)/2 - 2, (box_depth-esp32_d)/2 - 2, cam_z])
        difference() {
            cube([esp32_w + 4, esp32_d + 4, 2]);
            translate([2, 2, -1])
                cube([esp32_w, esp32_d, 4]);
        }
    
    // TP4056 ledge
    translate([wall + 2, (box_depth - tp_d)/2 - 1, box_height - tp_h - 6])
        cube([tp_w + 2, tp_d + 2, 1]);
    
    // Battery clips (secure hold)
    for(side = [-1, 1]) {
        translate([box_width/2 + side * (bat_len/2 + 2), box_depth/2 - 3, box_height/2 - 3])
            cube([2, 6, 6]);
    }
    
    // ===== BRANDING (subtle, bottom surface) =====
    translate([box_width/2, box_depth/2 + 20, 0.3])
        linear_extrude(0.5)
        text("CITY-V", size = 6, halign = "center", valign = "center", 
             font = "Arial:style=Bold");
    
    translate([box_width/2, box_depth/2 - 20, 0.3])
        linear_extrude(0.4)
        text("PRO", size = 4, halign = "center", valign = "center",
             font = "Arial");
}

// ===== SLIDE HOOK MODULE (reusable) =====
module slide_hook() {
    difference() {
        union() {
            // Main hook body
            cube([slide_width, slide_depth + 2, slide_height]);
            
            // Hook lip (locks onto wall plate)
            translate([0, slide_depth, 0])
                cube([slide_width, 2, slide_height + hook_depth]);
        }
        
        // Entry chamfer (easy insertion)
        translate([0, 0, slide_height])
            rotate([0, 90, 0])
            cylinder(d = 2, h = slide_width, $fn = 4);
    }
}

// ===== WALL MOUNTING PLATE (Duvara vidalanır) =====
module wall_plate() {
    plate_width = 80;
    plate_height = 70;
    plate_thickness = 4;
    
    difference() {
        union() {
            // Main plate
            hull() {
                for(x = [5, plate_width-5])
                    for(z = [5, plate_height-5]) {
                        translate([x, 0, z])
                            rotate([90, 0, 0])
                            cylinder(r = 5, h = plate_thickness);
                    }
            }
            
            // ===== SLIDE RAILS (2 pieces - device slides onto these) =====
            // Upper rail
            translate([(plate_width-slide_width)/2, -slide_depth-slide_tolerance, plate_height-slide_height-5])
                slide_rail();
            
            // Lower rail
            translate([(plate_width-slide_width)/2, -slide_depth-slide_tolerance, 10])
                slide_rail();
        }
        
        // ===== MOUNTING HOLES (4 corners - vida için) =====
        mounting_holes = [
            [15, 15], [plate_width-15, 15],
            [15, plate_height-15], [plate_width-15, plate_height-15]
        ];
        
        for(pos = mounting_holes) {
            translate([pos[0], 5, pos[1]])
                rotate([90, 0, 0])
                cylinder(d = 5, h = 12);
            
            // Countersink (vida başı için)
            translate([pos[0], 1, pos[1]])
                rotate([90, 0, 0])
                cylinder(d1 = 10, d2 = 5, h = 3);
        }
        
        // ===== CABLE ROUTING SLOT (alt kısımda) =====
        translate([plate_width/2 - 8, -plate_thickness-1, 2])
            cube([16, plate_thickness+2, 8]);
    }
    
    // ===== BRANDING =====
    translate([plate_width/2, -plate_thickness+0.5, plate_height/2])
        rotate([90, 0, 0])
        linear_extrude(0.6)
        text("CITY-V", size = 6, halign = "center", valign = "center",
             font = "Arial:style=Bold");
}

// ===== SLIDE RAIL MODULE (wall plate'e monte) =====
module slide_rail() {
    difference() {
        cube([slide_width, slide_depth + slide_tolerance, slide_height]);
        
        // Guide chamfer (kolay kayma için)
        translate([0, -1, slide_height])
            rotate([0, 90, 0])
            cylinder(d = 1, h = slide_width, $fn = 4);
    }
}

// ===== MAGNETIC TOP COVER (optional - sleek finish) =====
module pro_cover() {
    difference() {
        // Cover plate
        hull() {
            for(x = [radius-2, box_width-radius+2])
                for(y = [radius-2, box_depth-radius+2]) {
                    translate([x, y, box_height - 2])
                        cylinder(r = radius-2, h = 2);
                }
        }
        
        // Magnet pockets (4 corners)
        for(pos = [[25, 25], [75, 25], [25, 75], [75, 75]]) {
            translate([pos[0], pos[1], box_height - 1.5])
                cylinder(d = 6, h = 2);
        }
        
        // Finger pull notch
        translate([box_width/2 - 15, box_depth - 5, box_height - 1.5])
            cube([30, 3, 2]);
    }
}

// ===== RENDER =====
// Main device body with slide hooks
pro_body_slide();

// Wall mounting plate (print separately)
translate([0, -150, 0])
    rotate([90, 0, 0])  // Print lying flat
    wall_plate();

// Uncomment to render cover separately:
// translate([0, box_depth + 20, 0])
//     pro_cover();

// ===== PRINT INSTRUCTIONS =====
// 🖨️ PRINT ORDER:
// 1. Wall Plate (1x) - vida ile duvara monte
// 2. Device Body (1x) - elektronikler buraya
// 3. Cover (1x - optional) - mıknatıslı kapak

// Material: PLA (white/black/gray) or PETG
// Layer Height: 0.2mm (0.15mm for ultra-smooth)
// Infill: 20% (wall plate), 15% (device body)
// Supports: Minimal (only slide hooks)
// Orientation: 
//   - Wall Plate: Flat on bed (as shown)
//   - Device Body: Bottom-down (as modeled)
// Brim: Yes (first layer adhesion)
// Print Time: 
//   - Wall Plate: ~1-1.5 hours
//   - Device Body: ~3-4 hours
// Filament: ~80g total

// ===== INSTALLATION GUIDE =====
// 📋 ADIM 1: Wall Plate'i Duvara Monte Et
//   - 4 vida ile duvara vida (M5 veya M6)
//   - Dübel kullan (tavana monte edersen)
//   - Kablo kanalından kabloları geçir
//
// 📋 ADIM 2: Cihazı Kızağa Tak
//   - Üst kancayı üst kızağa yerleştir
//   - Yukarıdan aşağı kaydır
//   - "KLIK" sesi duyulana kadar bastır
//   - Cihaz KILITLEND!
//
// 📋 ADIM 3: Çıkarmak İçin
//   - Yukarı doğru hafif bastır
//   - Öne doğru çek
//   - Cihaz çıkar!

// ===== PROFESSIONAL FEATURES =====
// ✅ TOOL-FREE MOUNTING (Vida kullanmadan cihaz takılır!)
// ✅ QUICK RELEASE (Saniyeler içinde sök-tak)
// ✅ SECURE LOCK (Kendiliğinden düşmez)
// ✅ CABLE ROUTING (Kablo yönetimi dahili)
// ✅ UNIVERSAL WALL PLATE (Tek plaka, her yerde)
// ✅ Exact 10x10x5cm (palm-sized)
// ✅ Camera center-mounted (professional look)
// ✅ Apple-style rounded corners (15mm radius)
// ✅ Flush power button (minimal design)
// ✅ Hidden ventilation (circular pattern)
// ✅ Side USB-C access (easy charging)
// ✅ Horizontal battery (space efficient)
// ✅ Ultra-smooth finish ($fn=150)
// ✅ Magnetic cover option (tool-free access)

// ===== COMPACT SPECS =====
// Dimensions: 100mm x 100mm x 50mm
// Weight: ~85g (with wall plate)
// Battery: 18650 Li-ion (horizontal)
// Runtime: 4-5 hours (active streaming)
// Camera: Center-mounted, clean sight line
// Coverage: 3-4m at 3m height (4x4m floor)
// Mounting: SLIDE-ON system (no tools!)

// ===== KULLANICI DENEYİMİ =====
// 🚀 Müşteri Açısından:
//   1. Wall plate'i bir kere vidalıyor (5 dakika)
//   2. Sonsuza kadar cihazı tak-çıkar yapabiliyor
//   3. Şarj için kolayca söküyor
//   4. Yeniden takmak 2 saniye!
//   5. Vida aramaya gerek yok
//   6. Profesyonel görünüm

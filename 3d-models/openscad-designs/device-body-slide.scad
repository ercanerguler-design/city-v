// ============================================
// CITY-V BUSINESS BOX - DEVICE BODY ONLY
// Kızaklı Montaj Sistemi - Cihaz Gövdesi
// ============================================
// Bu dosya sadece cihaz gövdesini render eder
// Wall plate için wall-plate-slide.scad
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

// ===== SLIDE HOOK MODULE =====
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

// ===== RENDER =====
pro_body_slide();

// ===== PRINT INSTRUCTIONS =====
// Material: PLA or PETG
// Layer Height: 0.2mm
// Infill: 15%
// Supports: Minimal (slide hooks)
// Orientation: Bottom-down
// Brim: Yes
// Print Time: ~3-4 hours
// Filament: ~60g

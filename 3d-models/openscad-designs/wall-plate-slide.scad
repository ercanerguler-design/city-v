// ============================================
// CITY-V BUSINESS BOX - WALL PLATE ONLY
// Kızaklı Montaj Sistemi - Duvar Plakası
// ============================================
// Bu dosya sadece wall plate'i render eder
// Cihaz gövdesi için pro-compact-slide-mount.scad
// ============================================

$fn = 150;

// SLIDE MOUNT SYSTEM Parameters
slide_width = 60;
slide_depth = 8;
slide_height = 4;
slide_tolerance = 0.3;
hook_depth = 5;

// ===== SLIDE RAIL MODULE =====
module slide_rail() {
    difference() {
        cube([slide_width, slide_depth + slide_tolerance, slide_height]);
        
        // Guide chamfer
        translate([0, -1, slide_height])
            rotate([0, 90, 0])
            cylinder(d = 1, h = slide_width, $fn = 4);
    }
}

// ===== WALL MOUNTING PLATE =====
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
            
            // ===== SLIDE RAILS (2 pieces) =====
            // Upper rail
            translate([(plate_width-slide_width)/2, -slide_depth-slide_tolerance, plate_height-slide_height-5])
                slide_rail();
            
            // Lower rail
            translate([(plate_width-slide_width)/2, -slide_depth-slide_tolerance, 10])
                slide_rail();
        }
        
        // ===== MOUNTING HOLES (4 corners) =====
        mounting_holes = [
            [15, 15], [plate_width-15, 15],
            [15, plate_height-15], [plate_width-15, plate_height-15]
        ];
        
        for(pos = mounting_holes) {
            translate([pos[0], 5, pos[1]])
                rotate([90, 0, 0])
                cylinder(d = 5, h = 12);
            
            // Countersink
            translate([pos[0], 1, pos[1]])
                rotate([90, 0, 0])
                cylinder(d1 = 10, d2 = 5, h = 3);
        }
        
        // ===== CABLE ROUTING SLOT =====
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

// ===== RENDER =====
rotate([90, 0, 0])  // Print lying flat
    wall_plate();

// ===== PRINT INSTRUCTIONS =====
// Material: PLA or PETG
// Layer Height: 0.2mm
// Infill: 20%
// Supports: NO
// Orientation: Flat (as shown)
// Brim: Yes
// Print Time: ~1-1.5 hours
// Filament: ~20g

// ===== INSTALLATION =====
// 1. Duvara 4 vida ile monte et (M5 veya M6)
// 2. Dübel kullan (gerekirse)
// 3. Kablo kanalından kabloları geçir
// 4. Cihazı yukarıdan kaydırarak tak!

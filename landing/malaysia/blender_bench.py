"""Author a standalone, original bench-at-blue-hour Blender study.
No geographic accuracy, logo, or render success is implied. Run locally with
Blender 4.x: blender -b -t 4 -P blender_bench.py -- /path/to/output
The output is a design study; it is not auto-published or loaded by the page.
"""
import bpy
import math
import sys
from pathlib import Path
from mathutils import Vector

out = Path(sys.argv[sys.argv.index("--")+1]) if "--" in sys.argv else Path.cwd() / "blender-study"
out.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def material(name, color, metal=0.0, rough=0.5):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    return m

def cube(name, xyz, dims, mat, bevel=0.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=xyz)
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat)
    if bevel:
        mod=ob.modifiers.new("Machined edges", "BEVEL")
        mod.width=bevel
        mod.segments=3
        ob.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return ob

def aim(ob, point):
    ob.rotation_euler = (Vector(point)-ob.location).to_track_quat("-Z","Y").to_euler()

def area(name, xyz, target, energy, color, size):
    d=bpy.data.lights.new(name,"AREA")
    d.energy=energy
    d.color=color
    d.shape="DISK"
    d.size=size
    ob=bpy.data.objects.new(name,d)
    scene.collection.objects.link(ob)
    ob.location=xyz
    aim(ob,target)

wood=material("Smoked tropical timber",(0.18,0.074,0.028),0.0,0.32)
steel=material("Graphite powder-coated steel",(0.025,0.038,0.033),0.78,0.24)
stone=material("Rain-dark stone",(0.045,0.065,0.060),0.18,0.25)
glass=material("Distant architectural glass",(0.025,0.07,0.095),0.7,0.23)
silver=material("Architectural ribs",(0.33,0.40,0.41),0.8,0.28)
cube("Wet plaza",(0,0,-0.12),(70,70,0.2),stone,0)
for i in range(6):
    cube(f"Seat slat {i}",(0,-0.31+i*0.105,0.58),(2.8,0.09,0.08),wood,0.015)
for i in range(5):
    cube(f"Back slat {i}",(0,0.31,0.79+i*0.115),(2.8,0.065,0.10),wood,0.013)
for x in (-1.02,1.02):
    cube("Support foot",(x,0,0.08),(0.16,0.92,0.15),steel)
    cube("Leg",(x,0,0.32),(0.14,0.15,0.54),steel)
    cube("Back support",(x,0.32,0.85),(0.12,0.12,0.78),steel)
    cube("Seat crossbar",(x,0,0.49),(0.14,0.70,0.12),steel)
# Original abstract KL-inspired background, not a surveyed landmark replica.
for x in (-4.0,4.0):
    for n in range(15):
        z=0.45+n*0.72
        w=2.4-max(0,n-9)*0.21
        cube(f"Tower mass {x} {n}",(x,10,z),(w,w,0.68),glass,0.11)
        cube(f"Facade band {x} {n}",(x,10,z+0.31),(w+0.07,w+0.07,0.06),silver,0.02)
    cube("Spire",(x,10,12.0),(0.14,0.14,3.1),silver,0.02)
cube("Skybridge",(0,10,5.8),(5.8,0.45,0.48),silver,0.04)
area("Soft overcast key",(-4,-5,8),(0,0,0.5),1500,(0.68,0.80,1.0),6)
area("Warm urban rim",(4,3,5),(0,0,0.7),1000,(1.0,0.65,0.36),4)
area("Subtle emerald bounce",(-2,3,2),(0,0,0.5),80,(0.10,1.0,0.45),3)
scene.world=bpy.data.worlds.new("Blue hour")
scene.world.use_nodes=True
scene.world.node_tree.nodes["Background"].inputs[0].default_value=(0.065,0.095,0.16,1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value=0.45
bpy.ops.object.camera_add(location=(6.5,-8.2,2.45))
cam=bpy.context.object
aim(cam,(0,1.2,1.1))
cam.data.lens=38
scene.camera=cam
scene.render.engine="CYCLES"
scene.cycles.samples=64
scene.cycles.use_denoising=True
scene.render.resolution_x=1920
scene.render.resolution_y=1080
scene.render.resolution_percentage=100
scene.view_settings.view_transform="AgX"
scene.render.image_settings.file_format="PNG"
scene.render.filepath=str(out/"bench-blue-hour.png")
bpy.ops.wm.save_as_mainfile(filepath=str(out/"bench-blue-hour.blend"))
bpy.ops.render.render(write_still=True)

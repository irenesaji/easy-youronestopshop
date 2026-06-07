import math
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parent.parent
THUMBS_DIR = ROOT / "thumbs"


def make_box(size, offset=(0.0, 0.0, 0.0), color=(180, 180, 180, 255)):
    mesh = trimesh.creation.box(extents=size)
    mesh.apply_translation(offset)
    mesh.visual.vertex_colors = np.tile(np.array(color, dtype=np.uint8), (len(mesh.vertices), 1))
    return mesh


def make_cylinder(radius, height, sections=24, offset=(0.0, 0.0, 0.0), color=(180, 180, 180, 255)):
    mesh = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    mesh.apply_translation(offset)
    mesh.visual.vertex_colors = np.tile(np.array(color, dtype=np.uint8), (len(mesh.vertices), 1))
    return mesh


def make_sphere(radius, subdivisions=2, offset=(0.0, 0.0, 0.0), color=(180, 180, 180, 255)):
    mesh = trimesh.creation.icosphere(subdivisions=subdivisions, radius=radius)
    mesh.apply_translation(offset)
    mesh.visual.vertex_colors = np.tile(np.array(color, dtype=np.uint8), (len(mesh.vertices), 1))
    return mesh


def export_scene(meshes, out_path):
    scene = trimesh.Scene()
    for i, m in enumerate(meshes):
        scene.add_geometry(m, node_name=f"part_{i}")
    data = scene.export(file_type="glb")
    out_path.write_bytes(data)


def sofa(seed):
    np.random.seed(seed)
    w = 1.4 + np.random.rand() * 0.5
    d = 0.7 + np.random.rand() * 0.25
    h = 0.75 + np.random.rand() * 0.2
    c = (150 + seed * 10, 90 + seed * 8, 70 + seed * 6, 255)

    base = make_box((w, d, 0.25), (0, 0, 0.125), c)
    back = make_box((w, 0.12, h * 0.55), (0, -d / 2 + 0.06, 0.5), c)
    arm_l = make_box((0.12, d, h * 0.45), (-w / 2 + 0.06, 0, 0.42), c)
    arm_r = make_box((0.12, d, h * 0.45), (w / 2 - 0.06, 0, 0.42), c)
    return [base, back, arm_l, arm_r]


def cupboard(seed):
    np.random.seed(seed)
    w = 0.9 + np.random.rand() * 0.4
    d = 0.35 + np.random.rand() * 0.15
    h = 1.4 + np.random.rand() * 0.5
    c = (120 + seed * 7, 90 + seed * 4, 60 + seed * 5, 255)

    body = make_box((w, d, h), (0, 0, h / 2), c)
    seam = make_box((0.02, d + 0.01, h), (0, 0, h / 2), (70, 55, 40, 255))
    return [body, seam]


def dining_table(seed):
    np.random.seed(seed)
    w = 1.3 + np.random.rand() * 0.5
    d = 0.75 + np.random.rand() * 0.35
    top_t = 0.08
    h = 0.75
    c = (140 + seed * 6, 95 + seed * 5, 70 + seed * 4, 255)

    top = make_box((w, d, top_t), (0, 0, h), c)
    leg_o = 0.09
    leg_h = h
    leg_r = 0.04 + np.random.rand() * 0.02
    legs = [
        make_cylinder(leg_r, leg_h, offset=(w / 2 - leg_o, d / 2 - leg_o, leg_h / 2), color=(90, 70, 50, 255)),
        make_cylinder(leg_r, leg_h, offset=(-w / 2 + leg_o, d / 2 - leg_o, leg_h / 2), color=(90, 70, 50, 255)),
        make_cylinder(leg_r, leg_h, offset=(w / 2 - leg_o, -d / 2 + leg_o, leg_h / 2), color=(90, 70, 50, 255)),
        make_cylinder(leg_r, leg_h, offset=(-w / 2 + leg_o, -d / 2 + leg_o, leg_h / 2), color=(90, 70, 50, 255)),
    ]
    return [top] + legs


def bed(seed):
    np.random.seed(seed)
    w = 1.4 + np.random.rand() * 0.6
    d = 1.9 + np.random.rand() * 0.4
    frame_h = 0.25
    matt_h = 0.22
    c = (100 + seed * 8, 80 + seed * 7, 60 + seed * 6, 255)

    frame = make_box((w, d, frame_h), (0, 0, frame_h / 2), c)
    mattress = make_box((w * 0.95, d * 0.95, matt_h), (0, 0, frame_h + matt_h / 2), (220, 220, 220, 255))
    headboard = make_box((w, 0.1, 0.7), (0, -d / 2 + 0.05, 0.55), c)
    return [frame, mattress, headboard]


def chandelier(seed):
    np.random.seed(seed)
    stem = make_cylinder(0.03, 0.8, offset=(0, 0, 1.2), color=(160, 140, 70, 255))
    ring_r = 0.25 + np.random.rand() * 0.12
    ring = make_cylinder(0.02, 0.02, offset=(0, 0, 0.85), color=(160, 140, 70, 255))
    bulbs = []
    for i in range(6):
        a = (2 * math.pi * i) / 6
        bulbs.append(
            make_sphere(0.05, offset=(math.cos(a) * ring_r, math.sin(a) * ring_r, 0.82), color=(255, 230, 120, 255))
        )
    return [stem, ring] + bulbs


def lamp(seed):
    np.random.seed(seed)
    base = make_cylinder(0.16 + np.random.rand() * 0.04, 0.05, offset=(0, 0, 0.025), color=(130, 120, 105, 255))
    pole = make_cylinder(0.02, 0.9, offset=(0, 0, 0.5), color=(90, 90, 90, 255))
    shade = make_cylinder(0.16 + np.random.rand() * 0.06, 0.22, offset=(0, 0, 0.95), color=(240, 235, 220, 255))
    return [base, pole, shade]


def mirror(seed):
    np.random.seed(seed)
    w = 0.55 + np.random.rand() * 0.2
    h = 0.85 + np.random.rand() * 0.25
    frame = make_box((w, 0.06, h), (0, 0, h / 2), (150, 120, 65, 255))
    glass = make_box((w * 0.86, 0.02, h * 0.86), (0, 0.02, h / 2), (180, 215, 235, 210))
    return [frame, glass]


def shelf(seed):
    np.random.seed(seed)
    w = 1.0 + np.random.rand() * 0.45
    d = 0.35
    h = 1.6 + np.random.rand() * 0.4
    plank_t = 0.05
    c = (130, 95 + seed * 6, 70, 255)

    left = make_box((0.06, d, h), (-w / 2 + 0.03, 0, h / 2), c)
    right = make_box((0.06, d, h), (w / 2 - 0.03, 0, h / 2), c)
    shelves = []
    for lvl in [0.2, 0.55, 0.9, 1.25]:
        shelves.append(make_box((w, d, plank_t), (0, 0, lvl), c))
    return [left, right] + shelves


def table(seed):
    np.random.seed(seed)
    radius = 0.38 + np.random.rand() * 0.18
    top = make_cylinder(radius, 0.07, offset=(0, 0, 0.72), color=(120 + seed * 8, 95 + seed * 6, 70, 255))
    stem = make_cylinder(0.06, 0.65, offset=(0, 0, 0.35), color=(80, 80, 80, 255))
    foot = make_cylinder(0.22, 0.04, offset=(0, 0, 0.02), color=(90, 90, 90, 255))
    return [top, stem, foot]


GENERATORS = {
    "sofa": sofa,
    "cupboard": cupboard,
    "dining_table": dining_table,
    "bed": bed,
    "chandelier": chandelier,
    "lamp": lamp,
    "mirror": mirror,
    "shelf": shelf,
    "table": table,
}


def main():
    THUMBS_DIR.mkdir(parents=True, exist_ok=True)
    created = []

    for prefix, builder in GENERATORS.items():
        for i in range(1, 6):
            name = f"{prefix}{i}.glb"
            out = THUMBS_DIR / name
            meshes = builder(i)
            export_scene(meshes, out)
            created.append(name)

    print(f"Generated {len(created)} GLB files in {THUMBS_DIR}")


if __name__ == "__main__":
    main()

// Hero 3D: símbolo "S" da Status Brand feito de três tubos paralelos,
// metal preto brilhante com luz roxa vindo de trás.
// Script clássico com import() para funcionar também abrindo o index.html direto (file://).
(async () => {

const hero = document.querySelector(".hero3d");
const canvas = document.querySelector("#hx-canvas");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

function init(THREE, RoomEnvironment) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 7.6);

  // --- geometria do S: dois arcos tangentes, deslocados em 3 trilhas paralelas
  const R = 0.58, GAP = 0.19, TUBE = 0.072, WIDE = 1.38; // WIDE: alarga o S para a proporção da logo
  const deg = (d) => (d * Math.PI) / 180;
  function strokePoints(k) {
    const pts = [];
    const rTop = R + k * GAP, rBot = R - k * GAP;
    for (let a = 25; a <= 270; a += 5) pts.push(new THREE.Vector3(Math.cos(deg(a)) * rTop * WIDE, R + Math.sin(deg(a)) * rTop, 0));
    for (let a = 85; a >= -155; a -= 5) pts.push(new THREE.Vector3(Math.cos(deg(a)) * rBot * WIDE, -R + Math.sin(deg(a)) * rBot, 0));
    return pts;
  }

  const material = new THREE.MeshPhysicalMaterial({
    color: 0x0d0a14, metalness: 0.9, roughness: 0.2,
    clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.9,
  });

  const logo = new THREE.Group();
  const capGeo = new THREE.SphereGeometry(TUBE, 32, 16);
  for (const k of [-1, 0, 1]) {
    const pts = strokePoints(k);
    const curve = new THREE.CatmullRomCurve3(pts);
    logo.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 320, TUBE, 32, false), material));
    for (const p of [pts[0], pts[pts.length - 1]]) {
      const cap = new THREE.Mesh(capGeo, material);
      cap.position.copy(p);
      logo.add(cap);
    }
  }
  logo.rotation.z = -0.1;
  scene.add(logo);

  // --- luz: contraluz roxa forte atrás, recortes laterais e uma chave suave na frente
  const back = new THREE.PointLight(0x8b6cf0, 60, 12, 1.6);
  back.position.set(0, 0, -2.2);
  const rimL = new THREE.DirectionalLight(0xa58bff, 3.2);
  rimL.position.set(-4, 1.5, -2);
  const rimR = new THREE.DirectionalLight(0xc9b6ff, 2.4);
  rimR.position.set(4, -1, -1.5);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(-2, 3, 5);
  scene.add(back, rimL, rimR, key, new THREE.AmbientLight(0x6c5ad0, 0.15));

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // no celular a área é mais estreita: afasta a câmera para o S caber
    camera.position.z = camera.aspect < 1.2 ? 7.2 / Math.max(camera.aspect, 0.6) : 7.6;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  addEventListener("pointermove", (e) => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  let running = false, raf = 0;
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    eased.x += (pointer.x - eased.x) * 0.05;
    eased.y += (pointer.y - eased.y) * 0.05;
    logo.rotation.y = Math.sin(t * 0.45) * 0.38 + eased.x * 0.6;
    logo.rotation.x = Math.sin(t * 0.3) * 0.08 + eased.y * 0.35;
    logo.position.y = Math.sin(t * 0.9) * 0.06;
    back.position.x = Math.sin(t * 0.5) * 0.8;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function setRunning(on) {
    if (reduce) return;
    if (on && !running) { running = true; clock.start(); raf = requestAnimationFrame(frame); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }

  if (reduce) {
    logo.rotation.y = 0.25;
    renderer.render(scene, camera);
    addEventListener("resize", () => renderer.render(scene, camera));
  } else {
    let visible = true;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; setRunning(visible && !document.hidden); }).observe(hero);
    document.addEventListener("visibilitychange", () => setRunning(visible && !document.hidden));
    setRunning(true);
  }

  hero.classList.add("hx-ready");
}

try {
  const THREE = await import("three");
  const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");
  init(THREE, RoomEnvironment);
} catch (err) {
  console.warn("Hero 3D indisponível, usando imagem:", err);
  hero.classList.add("hx-nogl");
}
})();

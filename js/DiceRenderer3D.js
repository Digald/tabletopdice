export class DiceRenderer3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null; // Cannon.js physics world
        this.diceObjects = [];
        this.isRolling = false;
        
        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f3460);

        // Camera setup
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.container.querySelector('#dice-canvas'),
            antialias: true 
        });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Physics world setup
        this.world = new CANNON.World();
        this.world.gravity.set(0, -30, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();

        // Add ground
        this.addGround();
        
        // Add lighting
        this.addLights();

        // Add walls (invisible barriers)
        this.addWalls();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Start render loop
        this.animate();
    }

    addGround() {
        // Visual ground
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x16213e,
            transparent: true,
            opacity: 0.8 
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Physics ground
        const groundShape = new CANNON.Box(new CANNON.Vec3(10, 0.1, 10));
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.position.set(0, -0.1, 0);
        this.world.add(groundBody);
    }

    addWalls() {
        const wallHeight = 5;
        const wallThickness = 0.5;
        const arenaSize = 10;

        // Create invisible walls around the arena
        const walls = [
            { pos: [arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize] },
            { pos: [-arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize] },
            { pos: [0, wallHeight/2, arenaSize], size: [arenaSize, wallHeight, wallThickness] },
            { pos: [0, wallHeight/2, -arenaSize], size: [arenaSize, wallHeight, wallThickness] }
        ];

        walls.forEach(wall => {
            const wallShape = new CANNON.Box(new CANNON.Vec3(...wall.size));
            const wallBody = new CANNON.Body({ mass: 0 });
            wallBody.addShape(wallShape);
            wallBody.position.set(...wall.pos);
            this.world.add(wallBody);
        });
    }

    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light (main)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);

        // Point light (accent)
        const pointLight = new THREE.PointLight(0xe94560, 0.5, 50);
        pointLight.position.set(-5, 8, -5);
        this.scene.add(pointLight);
    }

    createDiceGeometry(sides) {
        let geometry;
        
        switch(sides) {
            case 4: // Tetrahedron
                geometry = new THREE.TetrahedronGeometry(1);
                break;
            case 6: // Cube
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 8: // Octahedron
                geometry = new THREE.OctahedronGeometry(1.2);
                break;
            case 10: // Pentagonal Trapezohedron (approximated with cylinder)
                geometry = new THREE.CylinderGeometry(1, 1.2, 2, 10);
                break;
            case 12: // Dodecahedron
                geometry = new THREE.DodecahedronGeometry(1.2);
                break;
            case 20: // Icosahedron
                geometry = new THREE.IcosahedronGeometry(1.2);
                break;
            case 100: // d% (approximated with cylinder)
                geometry = new THREE.CylinderGeometry(0.8, 1, 2, 10);
                break;
            case 2: // Coin (cylinder)
                geometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16);
                break;
            default:
                geometry = new THREE.BoxGeometry(2, 2, 2);
        }
        
        return geometry;
    }

    createDiceMaterial(sides) {
        return new THREE.MeshLambertMaterial({ 
            color: 0x000000, // Black dice
            transparent: false,
        });
    }

    createDicePhysicsShape(sides) {
        switch(sides) {
            case 4:
                return new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8));
            case 6:
                return new CANNON.Box(new CANNON.Vec3(1, 1, 1));
            case 8:
            case 12:
            case 20:
                return new CANNON.Sphere(1.2);
            case 10:
            case 100:
                return new CANNON.Cylinder(1, 1.2, 2, 8);
            case 2:
                return new CANNON.Cylinder(1.2, 1.2, 0.2, 16);
            default:
                return new CANNON.Box(new CANNON.Vec3(1, 1, 1));
        }
    }

    addNumbersToMesh(mesh, sides) {
        // For now, we'll skip adding numbers to keep it simple
        // In the future, this would add text textures or geometry for each face
        // This is where you'd implement proper die face numbering
    }

    async rollDice(dicePool) {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.clearDice();

        const results = [];
        let diceIndex = 0;

        // Create dice for each type
        Object.keys(dicePool).forEach(type => {
            const { count } = dicePool[type];
            const sides = this.getDiceSides(type);
            
            for (let i = 0; i < count; i++) {
                const dice = this.createDice(sides, diceIndex++);
                this.diceObjects.push(dice);
                results.push({
                    type,
                    mesh: dice.mesh,
                    body: dice.body,
                    sides
                });
            }
        });

        // Wait for dice to settle
        await this.waitForSettling();
        
        this.isRolling = false;
        return this.calculateResults(results);
    }

    createDice(sides, index) {
        // Create visual mesh
        const geometry = this.createDiceGeometry(sides);
        const material = this.createDiceMaterial(sides);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.addNumbersToMesh(mesh, sides);
        this.scene.add(mesh);

        // Create physics body
        const shape = this.createDicePhysicsShape(sides);
        const body = new CANNON.Body({ mass: 1 });
        body.addShape(shape);
        
        // Random starting position above the ground
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        const y = 10 + index * 2;
        
        body.position.set(x, y, z);
        
        // Random initial rotation and angular velocity
        body.quaternion.set(
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random()
        ).normalize();
        
        body.angularVelocity.set(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );

        // Add some initial velocity
        body.velocity.set(
            (Math.random() - 0.5) * 10,
            -5,
            (Math.random() - 0.5) * 10
        );

        this.world.add(body);

        return { mesh, body, sides };
    }

    waitForSettling() {
        return new Promise((resolve) => {
            const checkSettled = () => {
                const stillMoving = this.diceObjects.some(dice => {
                    const velocity = dice.body.velocity.length();
                    const angularVelocity = dice.body.angularVelocity.length();
                    return velocity > 0.1 || angularVelocity > 0.1;
                });

                if (!stillMoving) {
                    resolve();
                } else {
                    setTimeout(checkSettled, 100);
                }
            };

            // Give dice at least 2 seconds to roll
            setTimeout(checkSettled, 2000);
        });
    }

    calculateResults(diceResults) {
        // For now, return random results since we don't have face detection
        // In a full implementation, this would detect which face is up
        return diceResults.map((dice, index) => {
            const sides = this.getDiceSides(dice.type || 'd6');
            return Math.floor(Math.random() * sides) + 1;
        });
    }

    clearDice() {
        this.diceObjects.forEach(dice => {
            this.scene.remove(dice.mesh);
            this.world.remove(dice.body);
            dice.mesh.geometry.dispose();
            dice.mesh.material.dispose();
        });
        this.diceObjects = [];
    }

    getDiceSides(type) {
        const sidesMap = {
            d20: 20, d12: 12, d10: 10, d100: 100,
            d8: 8, d6: 6, d4: 4, d2: 2
        };
        return sidesMap[type] || 6;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Step physics
        this.world.step(1/60);
        
        // Update visual meshes from physics bodies
        this.diceObjects.forEach(dice => {
            dice.mesh.position.copy(dice.body.position);
            dice.mesh.quaternion.copy(dice.body.quaternion);
        });
        
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    destroy() {
        this.clearDice();
        window.removeEventListener('resize', this.handleResize);
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}
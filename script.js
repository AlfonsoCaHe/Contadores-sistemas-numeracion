// Configuración geométrica, caracteres y cantidad de cilindros específicos por base
const config = {
    bin: { base: 2, digits: ['0', '1'], radius: 18, count: 8 },      // 8 cilindros (00000000) -> Máximo 255
    oct: { base: 8, digits: ['0', '1', '2', '3', '4', '5', '6', '7'], radius: 45, count: 3 },      // 3 cilindros (000)
    dec: { base: 10, digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], radius: 55, count: 3 },     // 3 cilindros (000)
    hex: { base: 16, digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'], radius: 85, count: 2 }       // 2 cilindros (00)
};

let currentCount = 0;
let intervalId = null;
let frequency = 5; // Cambios por segundo por defecto

// Calcular el valor máximo que puede almacenar el sistema binario basado en sus cilindros (2^8 - 1 = 255)
const MAX_BINARY_VALUE = Math.pow(config.bin.base, config.bin.count) - 1;

const btnToggle = document.getElementById('btn-toggle');
const btnReset = document.getElementById('btn-reset');
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');

// Estructura para almacenar las referencias del DOM de los cilindros generados
const DOMRegistry = { bin: [], oct: [], dec: [], hex: [] };

// Construir la interfaz de cilindros de forma dinámica basada en la cantidad configurada
function createDashboard() {
    Object.keys(config).forEach(key => {
        const sys = config[key];
        const container = document.getElementById(`${key}-group`);
        const totalDigits = sys.digits.length;
        const angleStep = 360 / totalDigits;

        // Crear la cantidad de cilindros específica configurada para esta base
        for (let c = 0; c < sys.count; c++) {
            const viewport = document.createElement('div');
            viewport.classList.add('cylinder-viewport');

            const cylinder = document.createElement('div');
            cylinder.classList.add('cylinder');

            // Crear y colocar las caras 3D de los dígitos en el cilindro
            sys.digits.forEach((digit, index) => {
                const digitEl = document.createElement('div');
                digitEl.classList.add('digit');
                digitEl.textContent = digit;

                const angle = angleStep * index;
                digitEl.style.transform = `rotateX(${-angle}deg) translateZ(${sys.radius}px)`;
                cylinder.appendChild(digitEl);
            });

            viewport.appendChild(cylinder);
            container.appendChild(viewport);

            // Registrar para las actualizaciones posteriores
            DOMRegistry[key].push(cylinder);
        }
    });
    updateAllCounters();
}

// Convertir el entero global al sistema numérico específico y desglosarlo en sus cilindros individuales
function updateBaseCounters(key) {
    const sys = config[key];
    const cylinders = DOMRegistry[key];
    const totalDigits = sys.digits.length;
    const angleStep = 360 / totalDigits;

    let remainingValue = currentCount;

    // Procesar los cilindros dinámicamente de derecha a izquierda según la cantidad exacta que posee
    for (let i = sys.count - 1; i >= 0; i--) {
        const cylinderElement = cylinders[i];
        const digitValue = remainingValue % sys.base;
        
        // Rotación acumulativa basada en el valor absoluto del dígito
        const rotationAngle = angleStep * digitValue;
        cylinderElement.style.transform = `rotateX(${rotationAngle}deg)`;

        remainingValue = Math.floor(remainingValue / sys.base);
    }
}

function updateAllCounters() {
    updateBaseCounters('bin');
    updateBaseCounters('oct');
    updateBaseCounters('dec');
    updateBaseCounters('hex');
}

function startLoop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        // Validar si el siguiente incremento superaría el máximo binario permitido
        if (currentCount >= MAX_BINARY_VALUE) {
            clearInterval(intervalId);
            intervalId = null;
            btnToggle.textContent = 'Comenzar';
            return; // Detiene la ejecución antes de incrementar y desbordar
        }

        currentCount++;
        updateAllCounters();
    }, 1000 / frequency);
}

function toggleCounter() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        btnToggle.textContent = 'Comenzar';
    } else {
        // Evita iniciar si ya se encuentra en el límite máximo
        if (currentCount >= MAX_BINARY_VALUE) {
            alert('El contador binario ya está en su valor máximo (255). Haz clic en Reset para empezar de nuevo.');
            return;
        }
        btnToggle.textContent = 'Pausar';
        startLoop();
    }
}

// Detener el contador por completo y regresar todos los valores a 0
function resetCounter() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    currentCount = 0;
    btnToggle.textContent = 'Comenzar';
    updateAllCounters();
}

// Control dinámico de frecuencia mediante el control deslizante
speedSlider.addEventListener('input', (e) => {
    frequency = parseInt(e.target.value);
    speedVal.textContent = `${frequency} Hz`;
    
    // Si está activo, reinicia el temporizador inmediatamente con el nuevo ritmo
    if (intervalId) {
        startLoop();
    }
});

btnToggle.addEventListener('click', toggleCounter);
btnReset.addEventListener('click', resetCounter);

// Arrancar la inicialización
createDashboard();

// DOM Elements
const input = document.getElementById("input");
const buttons = document.querySelectorAll(".btn.btn-light");
const equalsbtn = document.getElementById("equals");
const clearbtn = document.getElementById("clear");
const delbtn = document.getElementById("del");
const percentbtn = document.getElementById("percent");
const squarebtn = document.getElementById("square");
const cubebtn = document.getElementById("cube");
const factorialbtn = document.getElementById("factorial");


// Number Buttons
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const buttonValue = button.getAttribute("data-val");
    
    if (shouldResetScreen) {
      currentInput = "";
      shouldResetScreen = false;
    }
    
    if (currentInput === "0" && buttonValue !== ".") {
      currentInput = buttonValue;
    } else {
      // Prevent multiple decimal points
      if (buttonValue === "." && currentInput.includes(".")) return;
      currentInput += buttonValue;
    }
    
    updateDisplay();
  });
});

// Clear Button Handler
clearbtn.addEventListener("click", clearAll);

// Delete Button Handler
delbtn.addEventListener("click", () => {
  if (currentInput.length === 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
});

// Calculator State
let currentInput = '0';
let previousInput = '';
let calculation = null;
let shouldResetScreen = false;

// Percent Button Handler
percentbtn.addEventListener("click", () => {
  try {
    if (!currentInput || currentInput === "0") {
      currentInput = "0%";
      updateDisplay();
      return;
    }
    
    // Toggle percentage sign
    if (currentInput.endsWith('%')) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput += '%';
    }
    updateDisplay();
  } catch (error) {
    handleError(error);
  }
});

// Equals Button Handler 
equalsbtn.addEventListener("click", () => {
  try {
    if (!currentInput || currentInput === "") return;
    
    // Handle standalone percentage (8% → 0.08)
    if (currentInput.endsWith('%') && !hasOperator(currentInput)) {
      const number = parseFloat(currentInput);
      currentInput = (number / 100).toString();
      updateDisplay();
      shouldResetScreen = true;
      return;
    }
    
    // Convert expression for evaluation
    let expression = currentInput;
    
    // First handle modulus operations (must be done before percentage conversion)
    expression = expression.replace(/([\d.]+)\s*%\s*([\d.]+)(?![%])/g, 
      (match, a, b) => `${parseFloat(a)} % ${parseFloat(b)}`);
    
    // Handle percentage operations
    expression = expression.replace(/([\d.]+)\s*([+-])\s*([\d.]+)%/g, 
      (match, num, op, percent) => {
        const value = parseFloat(num);
        const pct = parseFloat(percent);
        return op === '+' ? 
          `${value} + ${value * pct / 100}` : 
          `${value} - ${value * pct / 100}`;
      });
    
    // Convert remaining percentages to decimal (for percentage-percentage operations)
    expression = expression.replace(/([\d.]+)%/g, (match, num) => {
      return parseFloat(num) / 100;
    });
    
    // Replace 'mod' with modulus operator if present
    expression = expression.replace(/mod/gi, '%');
    
    // Evaluate the expression safely
    const result = evaluateMathExpression(expression);
    
    if (!isFinite(result)) {
      throw new Error("Math Error");
    }
    
    currentInput = result.toString();
    shouldResetScreen = true;
    updateDisplay();
  } catch (e) {
    handleError(e);
  }
});

// Enhanced evaluation function
function evaluateMathExpression(expr) {
  // First evaluate parentheses
  while (/\(([^()]+)\)/.test(expr)) {
    expr = expr.replace(/\(([^()]+)\)/g, (_, inner) => evaluateBasicOps(inner));
  }
  
  // Then evaluate the remaining expression
  return evaluateBasicOps(expr);
}

function evaluateBasicOps(expr) {
  // Handle *, /, % (modulus)
  while (/([\d.]+)\s*([*\/%])\s*([\d.]+)/.test(expr)) {
    expr = expr.replace(/([\d.]+)\s*([*\/%])\s*([\d.]+)/, (_, a, op, b) => {
      a = parseFloat(a); b = parseFloat(b);
      switch(op) {
        case '*': return a * b;
        case '/': 
          if (b === 0) throw new Error("Cannot divide by zero");
          return a / b;
        case '%': 
          if (b === 0) throw new Error("Cannot mod by zero");
          return a % b;
      }
    });
  }
  
  // Handle +, -
  while (/([\d.]+)\s*([+-])\s*([\d.]+)/.test(expr)) {
    expr = expr.replace(/([\d.]+)\s*([+-])\s*([\d.]+)/, (_, a, op, b) => {
      return op === '+' ? parseFloat(a) + parseFloat(b) : parseFloat(a) - parseFloat(b);
    });
  }
  
  return parseFloat(expr);
}

// Helper Functions
function hasOperator(input) {
  const cleaned = input.replace(/^-/, '');
  return /[+\-*\/%]/.test(cleaned);
}

function updateDisplay() { input.value = currentInput; }
//Clear A;; function
function clearAll() { 
  currentInput = '0'; 
  previousInput = ''; 
  calculation = null; 
  shouldResetScreen = false; 
  updateDisplay(); 
}

function handleError(error) {
  currentInput = "Error: " + error.message;
  shouldResetScreen = true;
  updateDisplay();
  setTimeout(clearAll, 1500);
}
// Square Button Handler
squarebtn.addEventListener("click", () => {
  try {
    const val = parseFloat(currentInput);
    if (isNaN(val)) throw new Error("Invalid Input");
    
    currentInput = (val * val).toString();
    updateDisplay();
  } catch (e) {
    handleError(e);
  }
});

// Cube Button Handler
cubebtn.addEventListener("click", () => {
  try {
    const val = parseFloat(currentInput);
    if (isNaN(val)) throw new Error("Invalid Input");
    
    currentInput = (val * val * val).toString();
    updateDisplay();
  } catch (e) {
    handleError(e);
  }
});

// Factorial Button Handler
factorialbtn.addEventListener("click", () => {
  try {
    const val = parseInt(currentInput);
    if (isNaN(val)) throw new Error("Invalid Input");
    if (val < 0) throw new Error("Negative numbers not allowed");
    if (val > 170) throw new Error("Value too large"); // 171! overflows
    
    let result = 1;
    for (let i = 2; i <= val; i++) {
      result *= i;
    }
    
    currentInput = result.toString();
    updateDisplay();
  } catch (e) {
    handleError(e);
  }
});

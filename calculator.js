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

// Calculator State
let currentInput = '0';
let previousInput = '';
let calculation = null;
let shouldResetScreen = false;

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

// Clear Button
clearbtn.addEventListener("click", clearAll);

// Delete Button
delbtn.addEventListener("click", () => {
  if (currentInput.length === 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
});

// Equals Button
equalsbtn.addEventListener("click", calculate);

// Percent Button
percentbtn.addEventListener("click", () => {
  try {
     // Handle empty input
    if (!currentInput || currentInput === "0") {
      currentInput = "0";
      updateDisplay();
      return;
    }

    // Determine which operation is being used
    let operator = null;
    if (currentInput.includes("+")) operator = "+";
    else if (currentInput.includes("-")) operator = "-";
    else if (currentInput.includes("*")) operator = "*";
    else if (currentInput.includes("/")) operator = "/";

    // Case 1: Simple percentage conversion (e.g., "9" → "0.09")
    if (!operator) {
      const number = parseFloat(currentInput);
      if (isNaN(number)) throw new Error("Invalid number");
      
      currentInput = (number / 100).toString();
      updateDisplay();
      shouldResetScreen = true;
      return;
    }

    // Case 2: Percentage operations
    const parts = currentInput.split(operator).map(p => p.trim());
    
    // Validation
    if (parts.length !== 2) throw new Error(`Format: number${operator}number`);
    if (parts.some(p => !p)) throw new Error("Missing values");
    
    const number = parseFloat(parts[0]);
    const percent = parseFloat(parts[1]);
    
    if (isNaN(number) || isNaN(percent)) throw new Error("Enter valid numbers");

    // Perform the appropriate calculation
    let result;
    switch (operator) {
      case "+":
        // Addition: 100 + 10% = 110 (100 + 10% of 100)
        result = number * (1 + (percent / 100));
        break;
      case "-":
        // Subtraction: 100 - 10% = 90 (100 - 10% of 100)
        result = number * (1 - (percent / 100));
        break;
      case "*":
        // Multiplication: 100 * 10% = 10 (100 × 10%)
        result = number * (percent / 100);
        break;
      case "/":
        // Division: 100 / 10% = 1000 (100 ÷ 10%)
        if (percent === 0) throw new Error("Cannot divide by zero");
        result = number / (percent / 100);
        break;
      default:
        throw new Error("Unsupported operation");
    }

    // Update display
    currentInput = result.toString();
    updateDisplay();
    shouldResetScreen = true;

  } catch (error) {
    handleError(error);
    // Auto-clear error after delay
    setTimeout(() => {
      if (currentInput.startsWith("Error")) clearAll();
    }, 1500);
  }
});

// Square Button
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

// Cube Button
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

// Factorial Button
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

// Helper Functions
function updateDisplay() {
  input.value = currentInput;
}

function clearAll() {
  currentInput = '0';
  previousInput = '';
  calculation = null;
  shouldResetScreen = false;
  updateDisplay();
}

function calculate() {
  try {
    // Don't evaluate empty expressions
    if (currentInput === "") return;
    
    // Replace × with *, ÷ with / for eval
    const expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');
    
    // Evaluate safely
    const result = Function(`'use strict'; return (${expression})`)();
    
    if (!isFinite(result)) {
      throw new Error("Math Error");
    }
    
    currentInput = result.toString();
    shouldResetScreen = true;
    updateDisplay();
  } catch (e) {
    handleError(e);
  }
}

function handleError(error) {
   console.error("Calculator error:", error.message);
  currentInput = "Error: " + error.message;
    shouldResetScreen = true;
    updateDisplay();
  // Reset after showing error
  setTimeout(clearAll, 1500);
}

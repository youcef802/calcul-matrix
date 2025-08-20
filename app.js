// ------- Helpers -------
function parseMatrix(text, expectedRows, expectedCols) {
  // input format: "1,2; 3,4"
  if (!text.trim()) throw new Error("Matrix is empty");
  const rows = text.split(";").map(r => r.trim()).filter(Boolean);
  if (expectedRows && rows.length !== Number(expectedRows)) {
    throw new Error(`Expected ${expectedRows} rows, got ${rows.length}`);
  }
  const matrix = rows.map((row, i) => {
    const cols = row.split(",").map(c => Number(c.trim()));
    if (cols.some(Number.isNaN)) throw new Error(`Invalid number at row ${i+1}`);
    if (expectedCols && cols.length !== Number(expectedCols)) {
      throw new Error(`Row ${i+1}: expected ${expectedCols} cols, got ${cols.length}`);
    }
    return cols;
  });
  return matrix;
}

function formatMatrix(m) {
  return m.map(r => r.join("\t")).join("\n");
}

function dim(m) { return { r: m.length, c: m[0]?.length || 0 }; }

// ------- Operations -------
function addMatrices(A, B) {
  const { r: rA, c: cA } = dim(A);
  const { r: rB, c: cB } = dim(B);
  if (rA !== rB || cA !== cB) throw new Error("A and B must have same dimensions for addition");
  const R = [];
  for (let i=0;i<rA;i++){
    R[i] = [];
    for (let j=0;j<cA;j++){
      R[i][j] = A[i][j] + B[i][j];
    }
  }
  return R;
}

function subMatrices(A, B) {
  const { r: rA, c: cA } = dim(A);
  const { r: rB, c: cB } = dim(B);
  if (rA !== rB || cA !== cB) throw new Error("A and B must have same dimensions for subtraction");
  const R = [];
  for (let i=0;i<rA;i++){
    R[i] = [];
    for (let j=0;j<cA;j++){
      R[i][j] = A[i][j] - B[i][j];
    }
  }
  return R;
}

function mulMatrices(A, B) {
  const { r: rA, c: cA } = dim(A);
  const { r: rB, c: cB } = dim(B);
  if (cA !== rB) throw new Error("A.cols must equal B.rows for multiplication");
  const R = Array.from({length: rA}, () => Array(cB).fill(0));
  for (let i=0;i<rA;i++){
    for (let j=0;j<cB;j++){
      let sum = 0;
      for (let k=0;k<cA;k++){ sum += A[i][k] * B[k][j]; }
      R[i][j] = sum;
    }
  }
  return R;
}

// ------- UI wiring -------
const $ = (id) => document.getElementById(id);
const rowsEl = $("rows");
const colsEl = $("cols");
const AEl = $("matrixA");
const BEl = $("matrixB");
const resEl = $("result");
const errEl = $("error");

$("applyDims").addEventListener("click", () => {
  const r = Number(rowsEl.value), c = Number(colsEl.value);
  AEl.placeholder = "مثال: " + Array.from({length:r}).map(()=> Array.from({length:c}).map((_,j)=> j+1).join(",")).join("; ");
  BEl.placeholder = "مثال: " + Array.from({length:r}).map(()=> Array.from({length:c}).map((_,j)=> j+1).join(",")).join("; ");
  errEl.textContent = "";
});

function run(op){
  try{
    errEl.textContent = "";
    const A = parseMatrix(AEl.value, Number(rowsEl.value), Number(colsEl.value));
    const B = parseMatrix(BEl.value, op === 'mul' ? Number(colsEl.value) : Number(rowsEl.value), op === 'mul' ? undefined : Number(colsEl.value));
    let R;
    if (op==='add') R = addMatrices(A,B);
    else if (op==='sub') R = subMatrices(A,B);
    else if (op==='mul') R = mulMatrices(A,B);
   resEl.textContent = formatMatrix(R);
errEl.textContent = ""; // ensure error cleared on success

  }catch(e){
    resEl.textContent = "—";
    errEl.textContent = e.message;
  }
}

$("btnAdd").addEventListener("click", ()=>run('add'));
$("btnSub").addEventListener("click", ()=>run('sub'));
$("btnMul").addEventListener("click", ()=>run('mul'));
$("btnClear").addEventListener("click", ()=>{ AEl.value=""; BEl.value=""; resEl.textContent="—"; errEl.textContent=""; });

// Self test (manual, for learning)
$("btnSelfTest").addEventListener("click", ()=>{
  const tests = [];
  tests.push((()=> {
    const A=[[1,2],[3,4]], B=[[5,6],[7,8]];
    const R=addMatrices(A,B);
    return JSON.stringify(R) === JSON.stringify([[6,8],[10,12]]) ? "PASS add" : "FAIL add";
  })());
  tests.push((()=> {
    const A=[[5,5],[5,5]], B=[[2,3],[4,1]];
    const R=subMatrices(A,B);
    return JSON.stringify(R) === JSON.stringify([[3,2],[1,4]]) ? "PASS sub" : "FAIL sub";
  })());
  tests.push((()=> {
    const A=[[1,2,3],[4,5,6]], B=[[7,8],[9,10],[11,12]];
    const R=mulMatrices(A,B);
    return JSON.stringify(R) === JSON.stringify([[58,64],[139,154]]) ? "PASS mul" : "FAIL mul";
  })());
  console.log(tests.join(" | "));
  errEl.textContent = "Check console (F12) for test results.";
});
$("btnSamples").addEventListener("click", ()=>{
  rowsEl.value = 2; colsEl.value = 2;
  AEl.value = "1,2; 3,4";
  BEl.value = "5,6; 7,8";
  resEl.textContent = "—"; errEl.textContent = "";
});

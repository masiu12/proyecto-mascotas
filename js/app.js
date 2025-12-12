const credentials = {user: 'admin', pass: '1234'};

// --- VECTORES GLOBALES 
let DB_OWNERS = [];
let DB_PETS = [];
let DB_APPOINTMENTS = [];
let DB_CART = [];

// --- UI elements ---
const nav = document.getElementById('mainNav');
const loginSection = document.getElementById('loginSection');
const navButtons = document.querySelectorAll('#mainNav button[data-section]');
const logoutBtn = document.getElementById('logoutBtn');

function showSection(id){
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  const el = document.getElementById(id+'Section'); if(el) el.classList.remove('hidden');
  navButtons.forEach(b=>b.classList.toggle('active', b.dataset.section===id));
}
navButtons.forEach(b=> b.addEventListener('click', ()=> showSection(b.dataset.section)));

// LOGIN
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', e=>{
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  if(u===credentials.user && p===credentials.pass){
    
    initApp();
    showSection('registro');
  } else alert('Credenciales incorrectas — demo: admin / 1234');
});
logoutBtn.addEventListener('click', ()=>{ location.reload(); });

function validarTelefonoBolivia(tel){
  const v = tel.replace(/\s|[-()]/g,'');
  return /^[67]\d{7}$/.test(v);
}

// --- Owners ---
const ownersListEl = document.getElementById('ownersList');
function renderOwners(){
  // Usamos directamente el vector DB_OWNERS
  ownersListEl.innerHTML = DB_OWNERS.length ? DB_OWNERS.map(o=>`<li><strong>${o.name}</strong> · ${o.phone} · ${o.email}</li>`).join('') : '<li class="muted">Sin dueños</li>';
  const petOwnerSelect = document.getElementById('petOwnerSelect');
  petOwnerSelect.innerHTML = DB_OWNERS.map((o,i)=>`<option value="${i}">${o.name}</option>`).join('') || '<option value="0">— sin dueño —</option>';
}
document.getElementById('ownerForm').addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('ownerName').value.trim();
  const phone = document.getElementById('ownerPhone').value.trim();
  const email = document.getElementById('ownerEmail').value.trim();
  
  if(!validarTelefonoBolivia(phone)){
    alert('Teléfono inválido.');
    return;
  }
  // Guardamos directamente en el vector
  DB_OWNERS.push({name, phone, email});
  renderOwners();
  e.target.reset();
});

// --- Pets ---
const petsListEl = document.getElementById('petsList');
function renderPets(){
  petsListEl.innerHTML = DB_PETS.length ? DB_PETS.map(p=>`<li><strong>${p.name}</strong> · ${p.species} · ${p.breed} · Dueño: ${DB_OWNERS[p.ownerIndex]?.name || '—'}</li>`).join('') : '<li class="muted">Sin mascotas</li>';
  const agPet = document.getElementById('agPetSelect');
  agPet.innerHTML = DB_PETS.map((p,i)=>`<option value="${i}">${p.name} (${p.species})</option>`).join('') || '<option value="0">— sin mascotas —</option>';
}
document.getElementById('petForm').addEventListener('submit', e=>{
  e.preventDefault();
  const petData = {
    name: document.getElementById('petName').value.trim(),
    species: document.getElementById('petSpecies').value,
    breed: document.getElementById('petBreed').value.trim(),
    ownerIndex: parseInt(document.getElementById('petOwnerSelect').value || '0')
  };
  DB_PETS.push(petData);
  renderPets();
  e.target.reset();
});

// --- Agenda ---
const appointmentsEl = document.getElementById('appointmentsList');
function renderAppointments(){
  appointmentsEl.innerHTML = DB_APPOINTMENTS.length ? DB_APPOINTMENTS.map(a=>{
    const pet = DB_PETS[a.petIndex] || {name:'—'}; return `<li>${a.date} ${a.time} · <strong>${pet.name}</strong> · ${a.service}</li>`;
  }).join('') : '<li class="muted">Sin citas</li>';
}
document.getElementById('agendaForm').addEventListener('submit', e=>{
  e.preventDefault();
  const date = document.getElementById('agDate').value; 
  const time = document.getElementById('agTime').value;
  const petIndex = parseInt(document.getElementById('agPetSelect').value || '0');
  
  const conflict = DB_APPOINTMENTS.find(a => a.date===date && a.time===time && a.petIndex===petIndex);
  if(conflict){ alert('Ya existe una cita.'); return; }
  
  DB_APPOINTMENTS.push({date, time, petIndex, service: document.getElementById('agServiceSelect').value});
  renderAppointments();
  e.target.reset();
});

// --- Catálogo y Carrito ---
const catalogData = [
  {id:1,name:'Baño Básico',desc:'Baño rápido',price:85.00},
  {id:2,name:'Baño + Corte',desc:'Baño completo',price:170.00},
  {id:3,name:'Comida Premium',desc:'Alimento',price:120.00}
];

function renderCatalog(){
  const el = document.getElementById('catalog');
  el.innerHTML = catalogData.map(p=>`
    <div class="product card">
      <h4>${p.name}</h4>
      <p>Bs ${p.price.toFixed(2)}</p>
      <button class="secondary" onclick="addToCart(${p.id})">Comprar</button>
    </div>
  `).join('');
}

window.addToCart = function(id){
  const item = catalogData.find(x=>x.id===id);
  const exist = DB_CART.find(c=>c.id===id);
  if(exist) exist.qty += 1; else DB_CART.push({...item, qty:1});
  renderCart();
}

function renderCart(){
  const cartItemsEl = document.getElementById('cartItems');
  if(!DB_CART.length){ cartItemsEl.innerHTML = 'Vacío'; updateTotals(); return; }
  
  cartItemsEl.innerHTML = DB_CART.map((c,i)=>`
    <div>${c.name} x ${c.qty} <button onclick="removeItem(${i})">x</button></div>
  `).join('');
  updateTotals();
}

window.removeItem = function(idx){
  DB_CART.splice(idx, 1);
  renderCart();
}

function updateTotals(){
  const subtotal = DB_CART.reduce((s,i)=> s + i.price * i.qty, 0);
  document.getElementById('total').textContent = 'Bs ' + (subtotal * 1.1).toFixed(2);
}
function updateTotals(){
const subtotal = DB_CART.reduce((s,i)=> s + i.price * i.qty, 0);
const tax = subtotal * 0.10;
const total = subtotal + tax;
document.getElementById('subtotal').textContent = 'Bs ' + subtotal.toFixed(2);
document.getElementById('tax').textContent = 'Bs ' + tax.toFixed(2);
document.getElementById('total').textContent = 'Bs ' + total.toFixed(2);
}
// botón 
const checkoutBtn = document.getElementById('checkoutBtn');


checkoutBtn.addEventListener('click', () => {
 
  alert('Compra realizada con éxito');
  
});
// INIT
function initApp(){ 
  renderOwners(); renderPets(); renderAppointments(); renderCatalog(); renderCart();
  nav.classList.remove('hidden'); 
  loginSection.classList.add('hidden');
}
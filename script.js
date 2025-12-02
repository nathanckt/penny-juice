document.addEventListener('DOMContentLoaded', function() {
    // Gérer les boutons de quantité
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    
    quantityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Trouver le conteneur du produit
            const productCard = this.closest('.product-card');
            const quantityDisplay = productCard.querySelector('.quantity');
            let currentQuantity = parseInt(quantityDisplay.textContent);
            
            // Augmenter ou diminuer selon le bouton cliqué
            if (this.classList.contains('plus')) {
                currentQuantity++;
            } else if (this.classList.contains('minus')) {
                if (currentQuantity > 0) {
                    currentQuantity--;
                }
            }
            
            // Mettre à jour l'affichage
            quantityDisplay.textContent = currentQuantity;
            // Mettre à jour le total après modification
            updateTotals();
        });
    });
    
    // --- Popovers d'info ---
    const infoButtons = document.querySelectorAll('.info-btn');

    // Générateur de contenu d'exemple 
    function makePopoverContent(title){
        return `
            <h4>${title} — Valeurs nutritionnelles</h4>
            <div class="nutri">
                <div>Calories: 42 kcal</div>
                <div>Sucres: 10 g</div>
                <div>Matières grasses: 0.2 g</div>
            </div>
            <div style="margin-top:8px;">Quantité par boisson: <strong>250 ml</strong></div>
            <div style="margin-top:8px;">Ingrédients:</div>
            <ul class="ingredients">
                <li>Jus de fruit concentré</li>
                <li>Eau</li>
                <li>Sucre</li>
                <li>Conservateur (E202)</li>
            </ul>
        `;
    }

    // Crée les popovers et attache les événements
    infoButtons.forEach(btn => {
        const productCard = btn.closest('.product-card');
        const titleEl = productCard.querySelector('.product-title');
        const title = titleEl ? titleEl.textContent.trim() : 'Produit';

        const pop = document.createElement('div');
        pop.className = 'info-popover';
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-hidden', 'true');
        pop.innerHTML = makePopoverContent(title);

    // garder des références pour usage ultérieur (utilisées par les handlers globaux)
        pop._ownerButton = btn;
        pop._ownerCard = productCard;


    // fonctions d'affichage
        function positionPopover(){
            // calcule la position pour que le popover apparaisse au-dessus du bouton (préféré)
            // s'assurer que le pop est présent dans document.body pour mesurer
            if (!document.body.contains(pop)) return;

            const rect = btn.getBoundingClientRect();
            const popW = pop.offsetWidth;
            const popH = pop.offsetHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;

            let top = scrollY + rect.top - popH - 10;
            let left = scrollX + rect.left + (rect.width / 2) - (popW / 2);

            // si pas assez d'espace au-dessus, placer en dessous
            const minTop = scrollY + 8;
            if (top < minTop) {
                top = scrollY + rect.bottom + 10;
                pop.classList.remove('arrow-bottom');
                pop.classList.add('arrow-top');
            } else {
                pop.classList.remove('arrow-top');
                pop.classList.add('arrow-bottom');
            }

            // rester dans la fenêtre (viewport) horizontalement
            const maxLeft = scrollX + window.innerWidth - 8 - popW;
            if (left < scrollX + 8) left = scrollX + 8;
            if (left > maxLeft) left = maxLeft;

            pop.style.left = Math.round(left) + 'px';
            pop.style.top = Math.round(top) + 'px';
        }

        function show(){
            if (window.innerWidth <= 520){
                if (pop.parentElement !== productCard.parentElement){
                    if (pop.parentElement) pop.parentElement.removeChild(pop);
                    productCard.parentNode.insertBefore(pop, productCard.nextSibling);
                    pop.classList.add('mobile-inline');
                }
                pop.classList.add('visible');
                pop.setAttribute('aria-hidden', 'false');
                return;
            }

            if (pop.parentElement !== document.body){
                if (pop.parentElement) pop.parentElement.removeChild(pop);
                document.body.appendChild(pop);
            }

            pop.classList.remove('mobile-inline');
            pop.classList.add('visible');
            pop.setAttribute('aria-hidden', 'false');
            positionPopover();
        }

        function hide(){
            pop.classList.remove('visible');
            pop.setAttribute('aria-hidden', 'true');
            pop.style.left = '';
            pop.style.top = '';
        }

        btn.addEventListener('mouseenter', function(){ if (window.innerWidth>520) show(); });
        btn.addEventListener('mouseleave', function(e){
            const to = e.relatedTarget;
            if (!pop.contains(to)) hide();
        });
        pop.addEventListener('mouseleave', hide);
        pop.addEventListener('mouseenter', show);

    // Focus (clavier)
        btn.addEventListener('focus', show);
        btn.addEventListener('blur', function(e){
            const to = e.relatedTarget;
            if (!pop.contains(to)) hide();
        });

    // Basculer au clic (utile pour écrans tactiles)
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            if (pop.classList.contains('visible')) hide(); else show();
        });
    });

    // repositionner les popovers visibles lors du scroll / redimensionnement
    function repositionAll(){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            if (p.classList.contains('mobile-inline')) return; // inline ones don't need reposition
            const btn = p._ownerButton;
            if (!btn) return;
            if (document.body.contains(p)){
                const rect = btn.getBoundingClientRect();
                const popW = p.offsetWidth;
                const popH = p.offsetHeight;
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;
                let top = scrollY + rect.top - popH - 10;
                let left = scrollX + rect.left + (rect.width / 2) - (popW / 2);
                const minTop = scrollY + 8;
                if (top < minTop) {
                    top = scrollY + rect.bottom + 10;
                    p.classList.remove('arrow-bottom');
                    p.classList.add('arrow-top');
                } else {
                    p.classList.remove('arrow-top');
                    p.classList.add('arrow-bottom');
                }
                const maxLeft = scrollX + window.innerWidth - 8 - popW;
                if (left < scrollX + 8) left = scrollX + 8;
                if (left > maxLeft) left = maxLeft;
                p.style.left = Math.round(left) + 'px';
                p.style.top = Math.round(top) + 'px';
            }
        });
    }

    window.addEventListener('scroll', repositionAll);
    window.addEventListener('resize', repositionAll);

    // Fermer les popovers ouverts lors d'un clic à l'extérieur
    document.addEventListener('click', function(e){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            // si le clic est à l'intérieur du popover ou de son bouton, ignorer
            if (p.contains(e.target) || (p._ownerButton && p._ownerButton.contains(e.target))) return;
            p.classList.remove('visible');
            p.setAttribute('aria-hidden', 'true');
        });
    });

    // Fermer les popovers avec la touche Échap
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' || e.key === 'Esc'){
            const open = document.querySelectorAll('.info-popover.visible');
            open.forEach(p => { p.classList.remove('visible'); p.setAttribute('aria-hidden', 'true'); });
        }
    });

    // ---- Logique des totaux du panier ----
    function formatCurrency(v){
        return v.toFixed(2);
    }

    function updateTotals(){
        const cards = document.querySelectorAll('.product-card');
        let totalQty = 0;
        let totalPrice = 0;
        const items = [];

        if (cards.length > 0){
            cards.forEach(card => {
                const price = parseFloat(card.dataset.price || '0');
                const qtyEl = card.querySelector('.quantity');
                const qty = qtyEl ? parseInt(qtyEl.textContent) || 0 : 0;
                const titleEl = card.querySelector('.product-title');
                const title = titleEl ? titleEl.textContent.trim() : '';
                totalQty += qty;
                totalPrice += price * qty;
                if (qty > 0) items.push({title, price, qty});
            });
            try {
                localStorage.setItem('pennyjuice_cart', JSON.stringify({totalQty, totalPrice, items}));
            } catch (e) {
                // ignore
            }
        } else {
            try {
                const raw = localStorage.getItem('pennyjuice_cart');
                if (raw){
                    const data = JSON.parse(raw);
                    totalQty = data.totalQty || 0;
                    totalPrice = data.totalPrice || 0;
                }
            } catch (e) {
                // ignore
            }
        }

        const qtyNode = document.querySelector('.total-quantity');
        const priceNode = document.querySelector('.total-price');
        if (qtyNode) qtyNode.textContent = totalQty;
        if (priceNode) priceNode.textContent = formatCurrency(totalPrice);
    }

    // Initialiser les totaux au chargement
    updateTotals();

    // --- Page Infos : persister le formulaire et naviguer vers le récap ---
    const infosPage = document.querySelector('.infos-page');
    if (infosPage){
        // pré-remplir les inputs depuis localStorage si disponibles
        try{
            const raw = localStorage.getItem('pennyjuice_form');
            if (raw){
                const data = JSON.parse(raw);
                Object.keys(data).forEach(k => {
                    const el = infosPage.querySelector('[name="'+k+'"]');
                    if (el) el.value = data[k];
                });
            }
        }catch(e){/* ignore */}

        const formEl = document.querySelector('#checkout-form');
        const totalBtn = document.querySelector('.total-btn');

        function clearValidation(){
            const inputs = infosPage.querySelectorAll('input[name]');
            inputs.forEach(i => i.classList.remove('input-error'));
            const fe = infosPage.querySelector('.form-error');
            if (fe){ fe.style.display = 'none'; fe.textContent = ''; }
        }

        function validateForm(){
            clearValidation();
            const required = ['firstName','lastName','email','address','city','postal'];
            const inputs = infosPage.querySelectorAll('input[name]');
            const payload = {};
            const errors = [];
            inputs.forEach(i => payload[i.name] = i.value || '');

            required.forEach(k => {
                const v = (payload[k] || '').trim();
                if (!v){
                    errors.push(k + ' required');
                    const el = infosPage.querySelector('[name="'+k+'"]'); if (el) el.classList.add('input-error');
                }
            });

            // simple email check
            if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)){
                errors.push('email invalid');
                const el = infosPage.querySelector('[name="email"]'); if (el) el.classList.add('input-error');
            }

            return {valid: errors.length === 0, payload, errors};
        }

        // effacer l'état de validation lors de la saisie
        infosPage.addEventListener('input', function(e){
            if (e.target && e.target.matches('input[name]')){
                e.target.classList.remove('input-error');
                const fe = infosPage.querySelector('.form-error'); if (fe){ fe.style.display='none'; fe.textContent=''; }
            }
        });

        if (totalBtn){
            totalBtn.addEventListener('click', function(e){
                // valider avant de naviguer
                const res = validateForm();
                if (!res.valid){
                    e.preventDefault();
                    const fe = infosPage.querySelector('.form-error');
                    if (fe){
                        fe.style.display = 'block';
                        fe.textContent = 'Veuillez remplir les champs obligatoires (surlignés).';
                    }
                    // focus first invalid
                    const firstInvalid = infosPage.querySelector('.input-error');
                    if (firstInvalid) firstInvalid.focus();
                    return;
                }

                // save form values to localStorage then navigate
                try{ localStorage.setItem('pennyjuice_form', JSON.stringify(res.payload)); }catch(e){}
                const href = totalBtn.getAttribute('href');
                if (href && href !== '#'){
                    // navigate
                }
            });
        }
    }

    // --- Page Récap : afficher panier et données du formulaire ---
    const recapPage = document.querySelector('.recap-page');
    if (recapPage){
        // lire le panier
        let cart = null;
        try{ cart = JSON.parse(localStorage.getItem('pennyjuice_cart') || 'null'); }catch(e){ cart=null; }
        const orderList = recapPage.querySelector('.recap-order-list');
        if (orderList){
            if (cart && Array.isArray(cart.items) && cart.items.length>0){
                cart.items.forEach(it => {
                    const li = document.createElement('li');
                    li.textContent = `${it.title} — ${it.qty} * ${it.price} $`;
                    orderList.appendChild(li);
                });
            } else {
                const li = document.createElement('li'); li.textContent = 'Aucun article dans le panier'; orderList.appendChild(li);
            }
        }

    // lire le formulaire
        let form = null;
        try{ form = JSON.parse(localStorage.getItem('pennyjuice_form') || 'null'); }catch(e){ form=null; }
        const personalList = recapPage.querySelector('.recap-personal-list');
        if (personalList){
            if (form){
                const names = ['Prénom', 'Nom', 'Entreprise', 'Téléphone', 'Adresse mail'];
                const keys = ['firstName','lastName','company','phone','email'];
                keys.forEach((k,i)=>{
                    const li = document.createElement('li');
                    li.textContent = `${names[i]} : ${form[k] || ''}`;
                    personalList.appendChild(li);
                });
            } else {
                const li = document.createElement('li'); li.textContent = 'Aucune information fournie'; personalList.appendChild(li);
            }
        }

        const deliveryList = recapPage.querySelector('.recap-delivery-list');
        if (deliveryList){
            if (form){
                const addr = `${form.address || ''}${form.city? ', '+form.city : ''}${form.province? ' '+form.province : ''}${form.postal? ' '+form.postal : ''}`;
                const li = document.createElement('li'); li.textContent = addr; deliveryList.appendChild(li);
            } else {
                const li = document.createElement('li'); li.textContent = 'Aucune information de livraison'; deliveryList.appendChild(li);
            }
        }

        // bouton paiement : pour l'instant affiche une alerte et vide le panier
        const payBtn = recapPage.querySelector('.payment-btn');
        if (payBtn){
            payBtn.addEventListener('click', function(e){
                e.preventDefault();
                alert('Paiement (demo) — commande simulée.');
                // optional: clear cart
                try{ localStorage.removeItem('pennyjuice_cart'); }catch(e){}
                updateTotals();
            });
        }
    }

    // --- Page de confirmation : afficher le récap et vider le panier ---
    const paymentPage = document.querySelector('.payment-page');
    if (paymentPage){
        const list = document.querySelector('.payment-order-list');
        const totalNode = document.querySelector('.payment-total-price');
        let cart = null;
        try{ cart = JSON.parse(localStorage.getItem('pennyjuice_cart') || 'null'); }catch(e){ cart = null; }

        if (list){
            if (cart && Array.isArray(cart.items) && cart.items.length>0){
                cart.items.forEach(it => {
                    const li = document.createElement('li');
                    li.textContent = `${it.title} — ${it.qty} × ${it.price} $`;
                    list.appendChild(li);
                });
                if (totalNode) totalNode.textContent = (cart.totalPrice || 0).toFixed(2);
            } else {
                const li = document.createElement('li'); li.textContent = 'Aucun article trouvé.'; list.appendChild(li);
                if (totalNode) totalNode.textContent = '0.00';
            }
        }

    // Vider le panier maintenant que la commande est confirmée
        try{ localStorage.removeItem('pennyjuice_cart'); }catch(e){}

        const btn = document.getElementById('back-home-btn');
        if (btn){
            btn.addEventListener('click', function(){
                try{ localStorage.removeItem('pennyjuice_form'); }catch(e){}
            });
        }
    }

    // Fermer les popovers ouverts quand on clique en dehors (fin)
    document.addEventListener('click', function(e){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            // si le clic est à l'intérieur de l'en-tête parent, ignorer
            const header = p.closest('.product-header');
            if (!header.contains(e.target)){
                p.classList.remove('visible');
                p.setAttribute('aria-hidden', 'true');
            }
        });
    });
});

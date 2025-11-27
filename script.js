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
        });
    });
    
    // --- Info popovers (hover, focus, click/touch) ---
    const infoButtons = document.querySelectorAll('.info-btn');

    // sample content generator; can be replaced with real data per product
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

    // Create popovers and wire events
    infoButtons.forEach(btn => {
        // determine product title if available
        const productCard = btn.closest('.product-card');
        const titleEl = productCard.querySelector('.product-title');
        const title = titleEl ? titleEl.textContent.trim() : 'Produit';

        const pop = document.createElement('div');
        pop.className = 'info-popover';
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-hidden', 'true');
        pop.innerHTML = makePopoverContent(title);

        // keep references for later (used by global handlers)
        pop._ownerButton = btn;
        pop._ownerCard = productCard;

        // Note: we don't append to DOM yet here. On show() we append either to body
        // (desktop) or inline after the product card (mobile) so it can escape overflow.

        // show/hide helpers
        function positionPopover(){
            // compute position so popover appears above the button (preferred)
            // ensure pop is in document.body to measure
            if (!document.body.contains(pop)) return;

            const rect = btn.getBoundingClientRect();
            const popW = pop.offsetWidth;
            const popH = pop.offsetHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollX = window.scrollX || window.pageXOffset;

            // prefer above
            let top = scrollY + rect.top - popH - 10;
            let left = scrollX + rect.left + (rect.width / 2) - (popW / 2);

            // if not enough space above, place below
            const minTop = scrollY + 8;
            if (top < minTop) {
                top = scrollY + rect.bottom + 10;
                pop.classList.remove('arrow-bottom');
                pop.classList.add('arrow-top');
            } else {
                pop.classList.remove('arrow-top');
                pop.classList.add('arrow-bottom');
            }

            // keep within viewport horizontally
            const maxLeft = scrollX + window.innerWidth - 8 - popW;
            if (left < scrollX + 8) left = scrollX + 8;
            if (left > maxLeft) left = maxLeft;

            pop.style.left = Math.round(left) + 'px';
            pop.style.top = Math.round(top) + 'px';
        }

        function show(){
            // On small screens, render inline under the product card
            if (window.innerWidth <= 520){
                // if not already inline, insert after card
                if (pop.parentElement !== productCard.parentElement){
                    // remove from body if present
                    if (pop.parentElement) pop.parentElement.removeChild(pop);
                    productCard.parentNode.insertBefore(pop, productCard.nextSibling);
                    pop.classList.add('mobile-inline');
                }
                pop.classList.add('visible');
                pop.setAttribute('aria-hidden', 'false');
                // no positioning needed for mobile-inline
                return;
            }

            // Desktop: append to body so it can escape card overflow and position above
            if (pop.parentElement !== document.body){
                // remove from previous parent if any
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
            // cleanup inline styles
            pop.style.left = '';
            pop.style.top = '';
        }

        // Hover (desktop)
        btn.addEventListener('mouseenter', function(){ if (window.innerWidth>520) show(); });
        btn.addEventListener('mouseleave', function(e){
            // if entering the popover, don't hide
            const to = e.relatedTarget;
            if (!pop.contains(to)) hide();
        });
        pop.addEventListener('mouseleave', hide);
        pop.addEventListener('mouseenter', show);

        // Focus (keyboard)
        btn.addEventListener('focus', show);
        btn.addEventListener('blur', function(e){
            const to = e.relatedTarget;
            if (!pop.contains(to)) hide();
        });

        // Toggle on click (useful for touch devices)
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            if (pop.classList.contains('visible')) hide(); else show();
        });
    });

    // reposition visible popovers on scroll/resize
    function repositionAll(){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            if (p.classList.contains('mobile-inline')) return; // inline ones don't need reposition
            const btn = p._ownerButton;
            if (!btn) return;
            // position if still in body
            if (document.body.contains(p)){
                // recompute using the same logic as positionPopover
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

    // Close any open popovers when clicking outside
    document.addEventListener('click', function(e){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            // if click inside the popover or its button, skip
            if (p.contains(e.target) || (p._ownerButton && p._ownerButton.contains(e.target))) return;
            p.classList.remove('visible');
            p.setAttribute('aria-hidden', 'true');
        });
    });

    // Close popovers on Escape
    document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' || e.key === 'Esc'){
            const open = document.querySelectorAll('.info-popover.visible');
            open.forEach(p => { p.classList.remove('visible'); p.setAttribute('aria-hidden', 'true'); });
        }
    });

    // Close any open popovers when clicking outside
    document.addEventListener('click', function(e){
        const open = document.querySelectorAll('.info-popover.visible');
        open.forEach(p => {
            // if click inside parent header, skip
            const header = p.closest('.product-header');
            if (!header.contains(e.target)){
                p.classList.remove('visible');
                p.setAttribute('aria-hidden', 'true');
            }
        });
    });
});

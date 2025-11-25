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
});

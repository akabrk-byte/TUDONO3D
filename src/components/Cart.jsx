function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Cart({ isOpen, items, onClose, onRemove, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? ' active' : ''}`}
        onClick={onClose}
      />
      <div className={`cart-drawer${isOpen ? ' active' : ''}`}>
        <div className="cart-header">
          <h2>SEU PEDIDO</h2>
          <button className="close-cart" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="empty-cart-msg">Seu carrinho está vazio.</p>
          ) : (
            items.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.images[0]} alt={item.name} />
                <div className="cart-item-info">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">{formatPrice(item.price)}</div>
                  <button className="remove-item" onClick={() => onRemove(index)}>
                    Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>TOTAL</span>
            <span>{items.length > 0 ? formatPrice(total) : 'R$ 0,00'}</span>
          </div>
          <button className="checkout-btn" onClick={onCheckout}>
            Finalizar no WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}

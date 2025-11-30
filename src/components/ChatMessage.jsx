import React from 'react';
import OptionCard from './OptionCard';

export default function ChatMessage({
  message,
  isInCart,
  addToCart,
  removeFromCart,
  formatCurrency
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl bg-blue-600 text-white rounded-2xl px-5 py-3">
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="space-y-3">
          <div className="bg-white text-gray-800 shadow-md border border-gray-100 rounded-2xl px-5 py-3">
            <p className="leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>

          {message.options && message.options.length > 0 && (
            <div className="space-y-3">
              {message.options.map((option, optIdx) => (
                <OptionCard
                  key={optIdx}
                  option={option}
                  isSelected={isInCart(option.type, option.data.id)}
                  onAdd={addToCart}
                  onRemove={removeFromCart}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

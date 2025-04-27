// Función para calcular el subtotal de un producto
export const calculateSubtotal = (product) => {
    console.log('Calculando Subtotal...', product);

    const { format, quantity = 0, width = 0, length = 0, price, discount = 0 } = product;

    let subtotal = 0;
    console.log("Format: ", format);

    switch (format) {
      case "Unidad":
        subtotal = price * quantity;
        break;
      case "Ancho x Largo":
        subtotal = price * quantity * width * length;
        break;
      case "Lado * Lado x Precio":
        subtotal = price * quantity * length * length;
        break;
      case "Unidad x Largo":
        subtotal = price * quantity * length;
        break;
      default:
        console.warn(`Formato no reconocido: ${format}`);
        subtotal = 0;
        break;
    }
  
    const discountAmount = subtotal * (discount / 100);
    console.log("Subtotal", subtotal);
    return subtotal - discountAmount;
  };
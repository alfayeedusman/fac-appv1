import Swal from 'sweetalert2';

export const swalHelpers = {
  // Confirmation dialogs
  confirmDelete: async (itemName: string, itemType: string = 'item') => {
    const result = await Swal.fire({
      title: `Delete ${itemType}?`,
      text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-gray-900 font-bold',
        htmlContainer: 'text-gray-600',
        confirmButton: 'rounded-md px-4 py-2 font-medium',
        cancelButton: 'rounded-md px-4 py-2 font-medium'
      }
    });
    return result.isConfirmed;
  },

  confirmAction: async (title: string, text: string, confirmText: string = 'Confirm') => {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-gray-900 font-bold',
        htmlContainer: 'text-gray-600',
        confirmButton: 'rounded-md px-4 py-2 font-medium',
        cancelButton: 'rounded-md px-4 py-2 font-medium'
      }
    });
    return result.isConfirmed;
  },

  // Success notifications
  showSuccess: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-gray-900 font-medium text-sm',
        htmlContainer: 'text-gray-600 text-xs'
      }
    });
  },

  // Error notifications
  showError: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      timer: 5000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-gray-900 font-medium text-sm',
        htmlContainer: 'text-gray-600 text-xs'
      }
    });
  },

  // Warning notifications
  showWarning: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-gray-900 font-medium text-sm',
        htmlContainer: 'text-gray-600 text-xs'
      }
    });
  },

  // Info notifications
  showInfo: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
        title: 'text-gray-900 font-medium text-sm',
        htmlContainer: 'text-gray-600 text-xs'
      }
    });
  },

  // Loading dialog
  showLoading: (title: string = 'Processing...', text?: string) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-gray-900 font-bold',
        htmlContainer: 'text-gray-600'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  // Close any open Swal
  close: () => {
    Swal.close();
  },

  // Custom form dialog for inventory operations
  showInventoryForm: async (title: string, fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea';
    value?: string | number;
    options?: Array<{value: string; label: string}>;
    required?: boolean;
  }>) => {
    const formHtml = fields.map(field => {
      if (field.type === 'select') {
        const options = field.options?.map(opt => 
          `<option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');
        return `
          <div class="mb-4 text-left">
            <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
            <select id="${field.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" ${field.required ? 'required' : ''}>
              ${options}
            </select>
          </div>
        `;
      } else if (field.type === 'textarea') {
        return `
          <div class="mb-4 text-left">
            <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
            <textarea id="${field.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>
          </div>
        `;
      } else {
        return `
          <div class="mb-4 text-left">
            <label class="block text-sm font-medium text-gray-700 mb-2">${field.label}</label>
            <input type="${field.type}" id="${field.id}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${field.value || ''}" ${field.required ? 'required' : ''} />
          </div>
        `;
      }
    }).join('');

    const result = await Swal.fire({
      title,
      html: `<form id="inventoryForm">${formHtml}</form>`,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        title: 'text-gray-900 font-bold',
        confirmButton: 'rounded-md px-4 py-2 font-medium',
        cancelButton: 'rounded-md px-4 py-2 font-medium'
      },
      preConfirm: () => {
        const formData: Record<string, any> = {};
        fields.forEach(field => {
          const element = document.getElementById(field.id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (element) {
            formData[field.id] = field.type === 'number' ? parseFloat(element.value) || 0 : element.value;
          }
        });
        return formData;
      }
    });

    return result.isConfirmed ? result.value : null;
  },

  // Stock level warning
  showStockWarning: (productName: string, currentStock: number, minStock: number) => {
    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock <= minStock && currentStock > 0;
    
    if (isOutOfStock) {
      return Swal.fire({
        title: 'Out of Stock!',
        text: `${productName} is completely out of stock. Please restock immediately.`,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Acknowledge',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-red-900 font-bold',
          htmlContainer: 'text-red-700',
          confirmButton: 'rounded-md px-4 py-2 font-medium'
        }
      });
    } else if (isLowStock) {
      return Swal.fire({
        title: 'Low Stock Warning',
        text: `${productName} is running low (${currentStock} remaining, minimum: ${minStock}). Consider restocking soon.`,
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Noted',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          title: 'text-yellow-900 font-bold',
          htmlContainer: 'text-yellow-700',
          confirmButton: 'rounded-md px-4 py-2 font-medium'
        }
      });
    }
  }
};

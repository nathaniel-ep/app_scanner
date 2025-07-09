import { toast } from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message.replace(/"/g, "").replace(/;/g, " "), {
  duration: 3000,
  style: {
    background: '#90ee90',
    color: '#000',
  },
});
};

export const showError = (message: string) => {
  toast.error(message.replace(/"/g, ""), {
  duration: 3000,
  style: {
    background: '#DA6C6C',
    color: '#000',
  },
});
};

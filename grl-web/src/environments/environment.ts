export const environment = {
    production: false,
    api: {
        url: 'http://localhost:4200/api', // Sử dụng proxy trong development
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
};
  
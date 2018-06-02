export const isValidEmail = (value) => {
  const emailPattern = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i;  // eslint-disable-line
  return emailPattern.test(value);
}

export const isValidRgbColor = (value) => {
  const rgbExp = /rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)/; // eslint-disable-line
  return rgbExp.test(value);
}

export const isValidHexColor = (value) => {
  const hexExp = /^#\w{6,8}/; // eslint-disable-line
  return hexExp.test(value);
}

export const isValidUrl = (value) => {
  const urlExp = /^http/; // eslint-disable-line
  return urlExp.test(value);
}

export const isValidLinearGradient = (value) => {
  const linearExp = /^linear-gradient/; // eslint-disable-line
  return linearExp.test(value);
}

export const isValidRadialGradient = (value) => {
  const RadialExp = /^radial-gradient/;; // eslint-disable-line
  return RadialExp.test(value);
}

export const isValidRuc = (ruc) => {
  let valid = false;
  let validatorDigit, i, intModule, multipliers, p, product, products, provinces, residue, sum, thirdDigit, validator, _i, _j, _k, _l, _len, _len1, _ref, _ref1;
  if ((_ref = ruc.length) !== 10 && _ref !== 13) {
    valid = false;
    throw new Error('Longitud incorrecta');
  }
  provinces = 22;
  let provinceCode = parseInt(ruc.substr(0, 2), 10);
  if (provinceCode < 1 || provinceCode > provinces) {
    valid = false;
    throw new Error('Código de provincia incorrecto');
  }
  thirdDigit = parseInt(ruc[2], 10);
  if (thirdDigit === 7 || thirdDigit === 8) {
    valid = false;
    throw new Error('Tercer dígito es inválido');
  }
  products = [];
  if (thirdDigit < 6) {
    intModule = 10;
    validator = parseInt(ruc.substr(9, 1), 10);
    p = 2;
    _ref1 = ruc.substr(0, 9);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      i = _ref1[_i];
      product = parseInt(i, 10) * p;
      if (product >= 10) {
        product -= 9;
      }
      products.push(product);
      if (p === 2) {
        p = 1;
      } else {
        p = 2;
      }
    }
  }
  if (thirdDigit === 6) {
    validator = parseInt(ruc.substr(8, 1), 10);
    intModule = 11;
    multipliers = [3, 2, 7, 6, 5, 4, 3, 2];
    for (i = _j = 0; _j <= 7; i = ++_j) {
      products[i] = parseInt(ruc[i], 10) * multipliers[i];
    }
    products[8] = 0;
  }
  if (thirdDigit === 9) {
    validator = parseInt(ruc.substr(9, 1), 10);
    intModule = 11;
    multipliers = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    for (i = _k = 0; _k <= 8; i = ++_k) {
      products[i] = parseInt(ruc[i], 10) * multipliers[i];
    }
  }
  sum = 0;
  for (_l = 0, _len1 = products.length; _l < _len1; _l++) {
    i = products[_l];
    sum += i;
  }
  residue = sum % intModule;
  validatorDigit = residue === 0 ? 0 : intModule - residue;
  if (thirdDigit === 6) {
    if (ruc.substr(9, 4) !== "0001") {
      valid = false;
      throw new Error('RUC de empresa del sector público debe terminar en 0001');
    }
    valid = validatorDigit === validator;
  }
  if (thirdDigit === 9) {
    if (ruc.substr(10, 3) !== "001") {
      valid = false;
      throw new Error('RUC de entidad privada debe terminar en 001');
    }
    valid = validatorDigit === validator;
  }
  if (thirdDigit < 6) {
    if (ruc.length > 10 && ruc.substr(10, 3) !== "001") {
      valid = false;
      throw new Error('RUC de persona natural debe terminar en 001');
    }
    valid = validatorDigit === validator;
  }

  return valid;
}

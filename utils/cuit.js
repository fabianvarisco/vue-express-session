
'use strict';

function validateAsCuil(cuil) {
  if (!cuil) {
    return {error: Error('Empty cuil')};
  }
  if (isNaN(cuil)) {
    try {
      cuil = parseInt(cuil, 10);
    } catch (err) {
      return {error: Error(`cuil [${cuil}] debe ser un numero`)};
    }
  }
  if ((cuil % 1) > 0) {
    return {error: Error(`cuil [${cuil}] debe ser un entero`)};
  }
  if (cuil < 20000000028 || cuil > 29999999999) {
    return {error: Error(`cuil [${cuil}] fuera de rango`)};
  }
  return {};
}

module.exports = { validateAsCuil };

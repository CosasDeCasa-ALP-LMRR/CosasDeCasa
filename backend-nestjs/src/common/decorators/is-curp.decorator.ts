import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsCURPConstraint implements ValidatorConstraintInterface {
  validate(curp: string) {
    if (typeof curp !== 'string') return false;
    // Expresión regular oficial para el formato del CURP en México
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
    return curpRegex.test(curp);
  }

  defaultMessage() {
    return 'El CURP proporcionado no tiene un formato válido (Ej. ABCD123456HMZNXX12). Esta validación ocurre en el servidor, no puede ser vulnerada manipulando el FrontEnd.';
  }
}

/**
 * Decorador personalizado para validar que un campo sea un CURP válido.
 * Esto demuestra que las validaciones complejas residen en el backend
 * y no pueden ser eludidas deshabilitando JavaScript en el navegador.
 */
export function IsCURPMexicano(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCURPConstraint,
    });
  };
}

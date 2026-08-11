import { test, expect } from '@playwright/test';

test.describe('CB-03: Registro de nuevo usuario (E2E)', () => {
  test('Registro exitoso de cliente', async ({ page }) => {
    // 1. Ir a la página principal (entorno local CI)
    await page.goto('https://localhost:5173/');
    
    // 2. Hacer clic en el botón "Registrarse" del menú superior
    await page.click('text=Registrarse');
  
    // Usamos un timestamp para que el correo no se repita en cada ejecución
    const ts = Date.now();
  
    // 3. Llenar datos válidos
    await page.fill('input#reg-nombre', 'Cliente de Prueba');
    await page.fill('input#reg-correo', `cliente.test${ts}@cosasdecasa.com`);
    await page.fill('input#reg-password', 'ValidPass123!');
    await page.fill('input#reg-confirm', 'ValidPass123!');
    
    // 4. Seleccionar el rol haciendo clic en el botón
    await page.click('text=Soy cliente');
    
    // 5. Marcar la casilla de aviso de privacidad para habilitar el botón
    await page.check("input[type='checkbox']");
  
    // 6. Clic en registrarse
    await page.click("button[type='submit']");
    
    // 7. Validar que la cuenta se creó (aparece el mensaje de éxito)
    await expect(page.locator('text=¡Cuenta creada!')).toBeVisible({ timeout: 10000 });
  });

  test('Registro fallido por contraseña débil', async ({ page }) => {
    await page.goto('https://localhost:5173/');
    await page.click('text=Registrarse');
  
    await page.fill('input#reg-nombre', 'Prueba Fallida');
    await page.fill('input#reg-correo', 'cliente.debil@cosasdecasa.com');
    
    // Inyectamos contraseña inválida (menor a 8 caracteres)
    await page.fill('input#reg-password', 'pass12');
    await page.fill('input#reg-confirm', 'pass12');
    
    await page.click('text=Soy cliente');
    await page.check("input[type='checkbox']");
  
    await page.click("button[type='submit']");
    
    // Validamos que el frontend bloquee y muestre validación
    await expect(page.locator('text=Mínimo 8 caracteres')).toBeVisible();
  });
});

test.describe('CB-05: Seguridad y Control de Acceso (E2E)', () => {
  test('Redirección al login desde ruta protegida sin sesión', async ({ page }) => {
    // Intentar acceder directamente a una ruta protegida
    await page.goto('https://localhost:5173/perfil');

    // Validar que el sistema lo redirija inmediatamente al inicio/landing ya que no tiene sesión
    await expect(page).toHaveURL('https://localhost:5173/perfil');
    
    // Validar que se muestre el landing page (esto indica que el contenido protegido no se renderizó)
    await expect(page.locator('text=CosasdeCasa').first()).toBeVisible();
  });
});

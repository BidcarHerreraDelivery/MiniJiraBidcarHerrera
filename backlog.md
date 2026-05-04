# Backlog — Mini Jira (MVP)
> **Formato:** BDD Gherkin declarativo  
> **Referencia:** PRD v1.0 · specs.md  
> **Contenido:** 3 historias de usuario validadas + 2 edge cases críticos  
> **Estado:** Listo para refinamiento con el equipo técnico

---

## HISTORIAS DE USUARIO

---

### HU-01 — Acceso al sistema por rol

**Como** miembro del equipo  
**Quiero** ingresar al sistema con mis credenciales y que este reconozca mi rol  
**Para** acceder únicamente a las funciones y datos que me corresponden según mis responsabilidades

```gherkin
Feature: Autenticación y control de acceso por rol

  Scenario: Un usuario con rol "Usuario" accede al tablero
    Given que existe una cuenta activa con rol "Usuario"
    When el miembro del equipo proporciona credenciales válidas
    Then accede al tablero con todos los tickets del equipo visibles
    And las opciones de gestión de otros usuarios no están disponibles para él

  Scenario: Un usuario con rol "Admin" accede al sistema
    Given que existe una cuenta activa con rol "Admin"
    When el administrador proporciona credenciales válidas
    Then accede al tablero con todos los tickets del equipo visibles
    And tiene disponibles las opciones de gestión de usuarios y tickets de cualquier miembro

  Scenario: Un usuario intenta acceder con credenciales incorrectas
    Given que existe una cuenta activa en el sistema
    When el miembro del equipo proporciona credenciales inválidas
    Then el acceso es denegado
    And se le informa que sus credenciales no son correctas
    And ningún dato del sistema es expuesto

  Scenario: Un usuario intenta realizar una acción fuera de su rol
    Given que un miembro autenticado tiene rol "Usuario"
    When intenta archivar un ticket que no le pertenece ni le fue asignado
    Then la acción es rechazada
    And se le informa que no tiene permisos para realizar esa operación
```

---

### HU-02 — Gestión del ciclo de vida de un ticket

**Como** miembro del equipo  
**Quiero** crear, actualizar y hacer seguimiento del estado de mis tickets  
**Para** que el equipo tenga visibilidad clara del trabajo en curso y su progreso real

```gherkin
Feature: Ciclo de vida completo de un ticket

  Scenario: Un usuario crea un ticket con los datos obligatorios
    Given que el miembro está autenticado en el sistema
    When registra un nuevo ticket con título y prioridad
    Then el ticket aparece en la columna "Por hacer" del tablero
    And queda registrado con su nombre como creador y la fecha de creación

  Scenario: Un usuario avanza el estado de un ticket que le fue asignado
    Given que existe un ticket en estado "Por hacer" asignado al miembro
    When el miembro cambia su estado a "En progreso"
    Then el ticket se mueve a la columna correspondiente en el tablero
    And la fecha de última edición se actualiza automáticamente

  Scenario: Un ticket es marcado como "Bloqueado"
    Given que existe un ticket en estado "En progreso"
    When el responsable lo mueve al estado "Bloqueado"
    Then el ticket aparece en la columna colapsable "Bloqueado"
    And continúa siendo visible en el dashboard de métricas con su estado real

  Scenario: El creador de un ticket lo archiva
    Given que un miembro autenticado es el creador de un ticket
    When decide archivar el ticket
    Then el ticket desaparece del tablero principal y de los filtros por defecto
    And sigue contabilizándose en el dashboard bajo "Cerrado/Archivado"
    And no puede recibir nuevos comentarios

  Scenario: Un usuario intenta archivar un ticket de otro miembro
    Given que un miembro autenticado tiene rol "Usuario"
    And el ticket fue creado por un compañero diferente
    When intenta archivarlo
    Then la acción es rechazada
    And el ticket permanece en su estado actual sin cambios
```

---

### HU-03 — Protección ante edición concurrente

**Como** miembro del equipo  
**Quiero** ser avisado cuando alguien más haya modificado un ticket que estoy editando  
**Para** no sobreescribir trabajo de mis compañeros sin saberlo ni perder mis propios cambios sin advertencia

```gherkin
Feature: Integridad de datos ante edición simultánea

  Scenario: Dos miembros editan el mismo ticket al mismo tiempo
    Given que dos miembros del equipo tienen abierto el mismo ticket para edición
    When el primer miembro guarda sus cambios
    And el segundo miembro intenta guardar los suyos después
    Then el sistema advierte al segundo miembro que el ticket fue modificado recientemente
    And le ofrece elegir entre conservar sus cambios o descartar y ver la versión actualizada
    And ninguna versión se pierde sin decisión explícita del usuario

  Scenario: El estado del ticket cambia mientras otro miembro lo está editando
    Given que un miembro tiene un ticket abierto en modo edición
    When otro miembro cambia el estado del ticket desde el tablero
    Then al intentar guardar, el sistema informa al editor sobre el cambio de estado ocurrido
    And le muestra el estado actual antes de confirmar el guardado

  Scenario: Un ticket es archivado mientras se redacta un comentario
    Given que un miembro está escribiendo un comentario en un ticket
    When otro miembro archiva ese ticket antes de que el comentario sea enviado
    Then el sistema rechaza el envío del comentario
    And le informa al redactor que el ticket fue archivado
    And el texto del comentario no se pierde para que el miembro pueda copiarlo si lo necesita
```

---

## EDGE CASES

---

### EC-01 — Creación de ticket con datos inválidos o ausentes

> **Deducido de:** PRD sección 2.2 — campos obligatorios (título ≤ 120 chars, prioridad requerida)  
> **Riesgo:** Sin validación explícita el sistema puede guardar tickets corruptos que contaminen el tablero y las métricas.

```gherkin
Feature: Validación de datos al crear un ticket

  Scenario: El usuario intenta crear un ticket sin título
    Given que un miembro autenticado abre el formulario de nuevo ticket
    When intenta guardar el ticket dejando el campo título vacío
    Then el sistema rechaza el guardado
    And señala el campo título como obligatorio
    And ningún ticket incompleto es registrado en el sistema

  Scenario: El usuario ingresa un título que supera el límite de caracteres
    Given que un miembro autenticado está completando el formulario de nuevo ticket
    When ingresa un título que supera los 120 caracteres
    Then el sistema impide seguir escribiendo más allá del límite
    And muestra un indicador visible del conteo de caracteres restantes
    And el formulario permanece en estado editable para que el miembro pueda corregirlo

  Scenario: El usuario intenta crear un ticket sin seleccionar prioridad
    Given que un miembro autenticado completa el formulario con título válido
    When intenta guardar sin haber seleccionado una prioridad
    Then el sistema rechaza el guardado
    And señala el campo prioridad como obligatorio
    And los datos ya ingresados en el formulario no se pierden

  Scenario: El usuario guarda un ticket con solo los campos obligatorios
    Given que un miembro autenticado ingresa un título válido y selecciona una prioridad
    When guarda el ticket sin completar los campos opcionales
    Then el ticket es creado exitosamente en estado "Por hacer"
    And los campos opcionales quedan vacíos sin generar errores
```

---

### EC-02 — Notificación por email a un usuario desactivado

> **Deducido de:** PRD secciones 2.1 y 2.7 — usuarios pueden ser dados de baja; el sistema envía emails por asignación y mención  
> **Riesgo:** El sistema puede fallar silenciosamente, generar errores en el servicio de mensajería o notificar a una dirección de correo ya reasignada a otra persona.

```gherkin
Feature: Manejo de notificaciones hacia usuarios desactivados

  Scenario: Se intenta asignar un ticket a un usuario desactivado
    Given que existe un ticket sin asignar en el tablero
    And un miembro del equipo fue desactivado del sistema
    When un Admin intenta asignar el ticket a ese usuario desactivado
    Then el sistema impide la asignación
    And le informa al Admin que ese usuario ya no está activo
    And sugiere reasignar a un miembro activo del equipo

  Scenario: Un miembro menciona en un comentario a un usuario desactivado
    Given que un miembro autenticado redacta un comentario en un ticket activo
    When escribe una mención a un usuario que ha sido desactivado
    Then el comentario se guarda correctamente
    And el sistema omite el envío del email de notificación para ese destinatario
    And registra internamente que la notificación no fue enviada por cuenta inactiva
    And no muestra un error al autor del comentario por esta causa

  Scenario: Un usuario es desactivado mientras tiene tickets asignados
    Given que un miembro activo tiene uno o más tickets asignados a su nombre
    When un Admin desactiva esa cuenta
    Then el sistema reasigna esos tickets al estado "Sin asignar"
    And el Admin recibe un email con el listado de tickets que quedaron sin responsable
    And los tickets conservan todo su historial y contenido sin modificaciones
```

---

## Tabla de priorización

| ID | Tipo | Dependencia | Riesgo si se omite |
|---|---|---|---|
| HU-01 | Historia | Ninguna | Sin roles no hay permisos; cualquier usuario puede hacer cualquier cosa |
| HU-02 | Historia | HU-01 | Sin esta historia no existe el producto |
| HU-03 | Historia | HU-02 | Los datos del equipo son poco confiables desde el día uno |
| EC-01 | Edge case | HU-02 | Tickets corruptos o incompletos contaminan el tablero y las métricas |
| EC-02 | Edge case | HU-01 + HU-02 | Emails a cuentas inactivas o tickets huérfanos sin responsable |

export interface MovementInput {
  forward: number; // -1 to 1
  right: number;   // -1 to 1
  isSprinting: boolean;
  isJumping: boolean;
  isInteracting: boolean;
}

export class InputController {
  private keys: { [code: string]: boolean } = {};
  public isMouseDown = false;
  private lastMouseX = 0;
  private lastMouseY = 0;

  // Touch Virtual Joystick input (-1 to 1)
  public virtualJoystick = { x: 0, y: 0 };
  public virtualJump = false;
  public virtualInteract = false;
  public virtualSprint = false;

  public onRotateCamera?: (deltaYaw: number, deltaPitch: number) => void;
  public onZoomCamera?: (deltaZoom: number) => void;
  public onToggleBuildMenu?: () => void;
  public onToggleInventory?: () => void;
  public onTogglePause?: () => void;

  private domElement: HTMLElement;

  constructor(domElement: HTMLElement) {
    this.domElement = domElement;
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.domElement.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.domElement.addEventListener('wheel', this.handleWheel, { passive: true });

    // Touch events for mobile camera rotation
    this.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.domElement.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.domElement.addEventListener('touchend', this.handleTouchEnd, { passive: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;

    if (e.code === 'KeyB') {
      if (this.onToggleBuildMenu) this.onToggleBuildMenu();
    } else if (e.code === 'KeyI') {
      if (this.onToggleInventory) this.onToggleInventory();
    } else if (e.code === 'Escape') {
      if (this.onTogglePause) this.onTogglePause();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleMouseDown = (e: MouseEvent) => {
    // Only capture on canvas
    if (e.button === 0 || e.button === 2) {
      this.isMouseDown = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isMouseDown) return;
    const deltaX = (e.clientX - this.lastMouseX) * 0.005;
    const deltaY = (e.clientY - this.lastMouseY) * 0.005;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.onRotateCamera) {
      this.onRotateCamera(deltaX, deltaY);
    }
  };

  private handleMouseUp = () => {
    this.isMouseDown = false;
  };

  private handleWheel = (e: WheelEvent) => {
    if (this.onZoomCamera) {
      this.onZoomCamera(e.deltaY * 0.008);
    }
  };

  private touchStartX = 0;
  private touchStartY = 0;
  private isTouching = false;

  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      this.isTouching = true;
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (!this.isTouching || e.touches.length === 0) return;
    const deltaX = (e.touches[0].clientX - this.touchStartX) * 0.006;
    const deltaY = (e.touches[0].clientY - this.touchStartY) * 0.006;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;

    if (this.onRotateCamera) {
      this.onRotateCamera(deltaX, deltaY);
    }
  };

  private handleTouchEnd = () => {
    this.isTouching = false;
  };

  public getMovement(cameraYaw: number): MovementInput {
    let forward = 0;
    let right = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) forward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) forward -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) right -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) right += 1;

    // Add touch joystick input
    if (this.virtualJoystick.y !== 0) forward += this.virtualJoystick.y;
    if (this.virtualJoystick.x !== 0) right += this.virtualJoystick.x;

    const isSprinting = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.virtualSprint);
    const isJumping = !!(this.keys['Space'] || this.virtualJump);
    const isInteracting = !!(this.keys['KeyE'] || this.virtualInteract);

    // Normalize diagonal vectors
    const len = Math.sqrt(forward * forward + right * right);
    if (len > 1) {
      forward /= len;
      right /= len;
    }

    return {
      forward,
      right,
      isSprinting,
      isJumping,
      isInteracting
    };
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.domElement.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.domElement.removeEventListener('wheel', this.handleWheel);
  }
}

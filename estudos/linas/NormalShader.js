const NormalShader = {
  name: "NormalShader",

  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
  },

  vertexShader: /* glsl */ `
  
          varying vec2 vUv;
          varying vec3 vPos;
  
          attribute float esBajadaPendiente;
          varying float vEsBajadaPendiente;
  
          attribute float adjacentB;
          varying float vAdjacentB;
          
          void main() {
              
              vUv = uv;
              vPos = position;
              vEsBajadaPendiente = esBajadaPendiente;			
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          
          }`,

  fragmentShader: /* glsl */ `
          
          uniform float opacity;
          
          uniform sampler2D tDiffuse;
          
          varying vec2 vUv;
          varying vec3 vPos;
          varying float vEsBajadaPendiente;
  
          void main() {
  
                float alturaRelativa = (vPos.y - 350.0) / 1500.0;
              
              vec3 colorLinea = vec3(1, 1, 1);
              float salto = 25.0;
              
              if (mod(vPos.z, salto) < 15.0) {
                  if (vEsBajadaPendiente > 0.0) {
                      if (vEsBajadaPendiente == 1.0) {
                          colorLinea = vec3(0.05, 0.05, 0.05);
                      } else {
                          colorLinea = vec3(0,0,0);
                      }
              }
                  // colorLinea = vec3(alturaRelativa, 0, 0);
              }
  
              gl_FragColor = vec4( colorLinea, 1.0);
              
          }`,
};

export { NormalShader };

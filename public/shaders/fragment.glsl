uniform float atmOpacity;
uniform float atmPowFactor;
uniform float atmMultiplier;
varying vec3 vNormal;
void main() {
  float intensity = pow(atmMultiplier - dot(vNormal, vec3(0.0, 0.0, 1.0)), atmPowFactor);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * atmOpacity;
}
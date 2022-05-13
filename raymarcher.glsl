/* precision highp float; */
uniform vec2 u_resolution;
uniform float u_time;
uniform float power;
uniform float angle;
uniform float pixelRatio;

#define QUARTER_PI 0.78539813397
#define HALF_PI 1.570796267
#define PI 3.1415925359
#define TWO_PI 6.2831852
#define MAX_STEPS 128
#define MAX_DIST 100.
#define SURFACE_DIST .0007

float dist(vec3 p) {
    vec4 s = vec4(0., 1., 6. + sin(u_time) * 3., 1.);
    float sphereDist = length(p - s.xyz) - s.w;
    float planeDist = p.y;

    float d = min(sphereDist, planeDist);
    /* d = length(p - s.xyz); */
    return d;
}

float mandeldist(vec3 p) {
    vec3 z = p;
    float dr = 1.;
    /* float pwr = 2. + (sin(u_time * .1) + 1.) / 2. * 6.; */
    float pwr = power;
    float r = 0.;

    for(int i = 0; i < 64; i++) {
        r = length(z);
        if(r > 1.5)
            break;

        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);
        dr = pow(r, pwr - 1.) * pwr * dr + 1.0;

        float zr = pow(r, pwr);
        theta *= pwr;
        phi *= pwr;

        z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        z += p;

    }

    /* return distance(p, z); */
    return .5 * log(r) * r / dr;
}

vec3 mandelNormal(vec3 p) {
    vec2 e = vec2(.0001, 0.);
    float d = mandeldist(p);

    return normalize(vec3(d - mandeldist(p - e.xyy), d - mandeldist(p - e.xyx), d - mandeldist(p - e.yyx)));
}

vec4 RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.;
    vec3 p;
    for(int i = 0; i < MAX_STEPS; i++) {
        p = ro + rd * dO;
        float ds = mandeldist(p);
        dO += ds * float(i) / float(MAX_STEPS);
        if(dO > MAX_DIST || ds < SURFACE_DIST)
            break;
    }
    return vec4(dO, mandelNormal(p));
}

vec3 getRayDirection(vec2 uv, vec3 ro, float angle) {
    float x = uv.x;
    float y = uv.y;

    vec3 dir = normalize(vec3(x, y, 1.));
    dir.xz *= mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    return dir;
    normalize(vec3(uv.x + (ro.x * HALF_PI / ro.z), uv.y, 1));
}

float mandelAO(vec3 ro, vec3 rd) {
    float occ = 0.;
    float sca = 1.;
    const int steps = 5;

    for(int i = 0; i < steps; i++) {
        float hr = .01 + .02 * float(i) / float(steps);
        vec3 pos = ro + rd * hr;
        float dd = dist(pos);
        /* float ao = clamp(-(dd - hr), 0., 1.);
        tally += ao * sca * vec4(1.); */
        occ += -(dd - hr) * sca;
        sca *= .75;
    }

    return clamp(1. - 3. * occ, 0., 1.);
}

const vec3 light = vec3(.2, .2, 1.);
const vec3 dark = vec3(0.05);

vec3 cosineColor(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}
vec3 palette(float t) {
    return cosineColor(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(0.01, 0.01, 0.01), vec3(0.00, 0.15, 0.20));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - (pixelRatio / 2.) * u_resolution) / u_resolution.y;
    /* vec3 ro = vec3(0., 0., -4.); */
    /* vec3 ro = vec3(sin(u_time * .1) * 3., 0., cos(u_time * .1) * 3.); */
    vec3 ro = vec3(sin(angle) * 3., 0., cos(angle) * 3.);
    /* vec3 rd = getRayDirection(uv, ro, -u_time * .1 + PI); */
    vec3 rd = getRayDirection(uv, ro, -angle + PI);

    vec4 scene = RayMarch(ro, rd);
    float d = scene.x;
    /* d *= mandelAO(ro, rd) * 5.; */
    d /= 12.;

    /* gl_FragColor = vec4(mix(light, dark, clamp(d, 0., 1.)), 1.); */
    gl_FragColor = vec4(scene.yzw, 1.);

    /* gl_FragColor *= mandelAO(ro, rd); */

    /* gl_FragColor = vec4(u_resolution / 10., 0., 1.); */
}
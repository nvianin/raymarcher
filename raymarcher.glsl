precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.1415925359
#define TWO_PI 6.2831852
#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURFACE_DIST .01

float dist(vec3 p) {
    vec4 s = vec4(0., 1., 6. + sin(u_time) * 3., 1.);
    float sphereDist = length(p - s.xyz) - s.w;
    float planeDist = p.y;

    float d = min(sphereDist, planeDist);
    /* d = length(p - s.xyz); */
    return d;
}

float mandeldist(vec3 p) {
    float dr = 1.;
    float pwr = 1.2;
    float r = 0.;

    for(int i = 0; i < 50; i++) {
        r = length(p);
        if(r > 10.)
            break;

        float theta = acos(p.z / r);
        float phi = atan(p.z, p.x);
        float dr = pow(r, pwr - 1.) * pwr * dr + 1.0;

        float zr = pow(r, pwr);
        theta *= pwr;
        phi *= pwr;

        vec3 point = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
        point += p;

        /* return distance(p, point); */
        return .5 * log(r) * r / dr;

    }

}

float RayMarch(vec3 ro, vec3 rd) {
    float dO = 0.;
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dO;
        float ds = mandeldist(p);
        dO += ds;
        if(dO > MAX_DIST || ds < SURFACE_DIST)
            break;
    }
    return dO;
}

void main() {
    vec2 resolution = u_resolution;
    vec2 uv = (gl_FragCoord.xy - .5 * resolution) / resolution.y;
    vec3 ro = vec3(0., 0., -1.);
    vec3 rd = normalize(vec3(uv.x, uv.y, 1));
    float d = RayMarch(ro, rd);
    d /= 10.;
    gl_FragColor = vec4(vec3(d), 1.);
    /* gl_FragColor = vec4(uv, 0., 1.); */
}
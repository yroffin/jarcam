import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class StlLoaderService {

  /**
   * @author aleeper / http://adamleeper.com/
   * @author mrdoob / http://mrdoob.com/
   * @author gero3 / https://github.com/gero3
   * @author Mugen87 / https://github.com/Mugen87
   *
   * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
   *
   * Supports both binary and ASCII encoded files, with automatic detection of type.
   *
   * The loader returns a non-indexed buffer geometry.
   *
   * Limitations:
   *  Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL_(file_format)#Color_in_binary_STL).
   *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
   *  ASCII decoding assumes file is UTF-8.
   *
   * Usage:
   *  let loader = new THREE.STLLoader();
   *  loader.load( './models/stl/slotted_disk.stl', function ( geometry ) {
   *    scene.add( new THREE.Mesh( geometry ) );
   *  });
   *
   * For binary STLs geometry might contain colors for vertices. To use it:
   *  // use the same code to load STL as above
   *  if (geometry.hasColors) {
   *    material = new THREE.MeshPhongMaterial({ opacity: geometry.alpha, vertexColors: THREE.VertexColors });
   *  } else { .... }
   *  let mesh = new THREE.Mesh( geometry, material );
   */

  private manager: any;

  constructor() {
  }

  public loadStl(url, onLoadStl: (geometry: THREE.BufferGeometry) => void, onProgress, onError) {
    this.load(url, (geometry) => {
      onLoadStl(geometry);
    });
  }

  public loadStlFromBinary(bin, onLoadStl: (geometry: THREE.BufferGeometry) => void, onProgress, onError) {
    const geometry = this.parse(bin);
    onLoadStl(geometry);
  }

  private load(absoluteFileName, onLoad, onProgress?, onError?) {
    const that = this;
    // Loading tar file with an ajax request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', absoluteFileName, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = function () {
      if (this.readyState === this.DONE) {
        if (xhr.status === 200) {
          const geometry = that.parse(this.response);
          onLoad(geometry);
        } else {
          throw new Error('Error HTTP ' + xhr.status + ' when loading file : ' + absoluteFileName);
        }
      }
    };
    xhr.send(null);
  }

  private parse(data): THREE.BufferGeometry {

    const isBinary = () => {

      let expect, face_size, n_faces, reader;
      reader = new DataView(binData);
      face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
      n_faces = reader.getUint32(80, true);
      expect = 80 + (32 / 8) + (n_faces * face_size);

      if (expect === reader.byteLength) {

        return true;

      }

      // An ASCII STL data must begin with 'solid ' as the first six bytes.
      // However, ASCII STLs lacking the SPACE after the 'd' are known to be
      // plentiful.  So, check the first 5 bytes for 'solid'.

      // US-ASCII ordinal values for 's', 'o', 'l', 'i', 'd'
      let solid = [115, 111, 108, 105, 100];

      for (let i = 0; i < 5; i++) {

        // If solid[ i ] does not match the i-th byte, then it is not an
        // ASCII STL; hence, it is binary and return true.

        if (solid[i] != reader.getUint8(i, false)) return true;

      }

      // First 5 bytes read "solid"; declare it to be an ASCII STL
      return false;

    };

    const binData = this.ensureBinary(data);

    return isBinary() ? this.parseBinary(binData) : this.parseASCII(this.ensureString(data));
  }

  private parseBinary(data): THREE.BufferGeometry {

    const reader = new DataView(data);
    const faces = reader.getUint32(80, true);

    let r, g, b, hasColors = false, colors;
    let defaultR, defaultG, defaultB, alpha;

    // process STL header
    // check for default color in header ("COLOR=rgba" sequence).

    for (let index = 0; index < 80 - 10; index++) {

      if ((reader.getUint32(index, false) == 0x434F4C4F /*COLO*/) &&
        (reader.getUint8(index + 4) == 0x52 /*'R'*/) &&
        (reader.getUint8(index + 5) == 0x3D /*'='*/)) {

        hasColors = true;
        colors = [];

        defaultR = reader.getUint8(index + 6) / 255;
        defaultG = reader.getUint8(index + 7) / 255;
        defaultB = reader.getUint8(index + 8) / 255;
        alpha = reader.getUint8(index + 9) / 255;

      }

    }

    const dataOffset = 84;
    const faceLength = 12 * 4 + 2;

    const geometry = new THREE.BufferGeometry();

    const vertices = [];
    const normals = [];

    for (let face = 0; face < faces; face++) {

      const start = dataOffset + face * faceLength;
      const normalX = reader.getFloat32(start, true);
      const normalY = reader.getFloat32(start + 4, true);
      const normalZ = reader.getFloat32(start + 8, true);

      if (hasColors) {

        const packedColor = reader.getUint16(start + 48, true);

        if ((packedColor & 0x8000) === 0) {

          // facet has its own unique color

          r = (packedColor & 0x1F) / 31;
          g = ((packedColor >> 5) & 0x1F) / 31;
          b = ((packedColor >> 10) & 0x1F) / 31;

        } else {

          r = defaultR;
          g = defaultG;
          b = defaultB;

        }

      }

      for (let i = 1; i <= 3; i++) {

        const vertexstart = start + i * 12;

        vertices.push(reader.getFloat32(vertexstart, true));
        vertices.push(reader.getFloat32(vertexstart + 4, true));
        vertices.push(reader.getFloat32(vertexstart + 8, true));

        normals.push(normalX, normalY, normalZ);

        if (hasColors) {

          colors.push(r, g, b);

        }

      }

    }

    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    if (hasColors) {
      geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      // geometry.hasColors = true;
      // geometry.alpha = alpha;
    }

    return geometry;

  }

  private parseASCII(data): THREE.BufferGeometry {

    let geometry, patternFace, patternNormal, patternVertex, result, text;
    geometry = new THREE.BufferGeometry();
    patternFace = /facet([\s\S]*?)endfacet/g;

    const vertices = [];
    const normals = [];

    const normal = new THREE.Vector3();

    while ((result = patternFace.exec(data)) !== null) {

      text = result[0];
      patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

      while ((result = patternNormal.exec(text)) !== null) {

        normal.x = parseFloat(result[1]);
        normal.y = parseFloat(result[3]);
        normal.z = parseFloat(result[5]);

      }

      patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

      while ((result = patternVertex.exec(text)) !== null) {

        vertices.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
        normals.push(normal.x, normal.y, normal.z);

      }

    }

    geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));

    return geometry;
  }

  private ensureString(buf) {

    if (typeof buf !== "string") {

      const array_buffer = new Uint8Array(buf);
      const strArray = [];
      for (let i = 0; i < buf.byteLength; i++) {

        strArray.push(String.fromCharCode(array_buffer[i])); // implicitly assumes little-endian

      }
      return strArray.join('');

    } else {

      return buf;

    }

  }

  private ensureBinary(buf) {

    if (typeof buf === "string") {

      const array_buffer = new Uint8Array(buf.length);
      for (let i = 0; i < buf.length; i++) {

        array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian

      }
      return array_buffer.buffer || array_buffer;

    } else {

      return buf;

    }

  }

}

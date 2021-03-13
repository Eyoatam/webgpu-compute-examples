const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

if (!device) {
  console.error("No adapter found");
  Deno.exit(0);
}

// deno-fmt-ignore
const firstMatrix = new Float32Array([
  2, 4,
  1, 2, 3, 4,
  5, 6, 7, 8
])

const gpuBufferFirstMatrix = device.createBuffer({
  mappedAtCreation: true,
  size: firstMatrix.byteLength,
  usage: GPUBufferUsage.STORAGE,
});

const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
gpuBufferFirstMatrix.unmap();

// deno-fmt-ignore
const secondMatrix = new Float32Array([
  4, 2,
  1, 2,
  3, 4,
  5, 6,
  7, 8
])

const gpuBufferSecondMatrix = device.createBuffer({
  mappedAtCreation: true,
  size: secondMatrix.byteLength,
  usage: GPUBufferUsage.STORAGE,
});

const arrayBufferSecondMatrix = gpuBufferSecondMatrix.getMappedRange();
new Float32Array(arrayBufferSecondMatrix).set(secondMatrix);
gpuBufferSecondMatrix.unmap();

const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT *
  (2 + firstMatrix[0] * secondMatrix[0]);
const resultMatrixBuffer = device.createBuffer({
  size: resultMatrixBufferSize,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
});

const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "read-only-storage",
      },
    },
    {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "read-only-storage",
      },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: {
        type: "storage",
      },
    },
  ],
});

const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: {
        buffer: gpuBufferFirstMatrix,
      },
    },
    {
      binding: 1,
      resource: {
        buffer: gpuBufferSecondMatrix,
      },
    },
    {
      binding: 2,
      resource: {
        buffer: resultMatrixBuffer,
      },
    },
  ],
});

/**
 * @todo add wgsl shader code
 */

const computeShader = `
`;

const computePipeline = device.createComputePipeline({
  layout: device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  }),
  compute: {
    module: device.createShaderModule({
      code: computeShader,
    }),
    entryPoint: "main",
  },
});

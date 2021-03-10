const adapter = await navigator.gpu.requestAdapter();
const device = await adapter?.requestDevice();

if (!device) {
  console.error("no suitable adapter found");
  Deno.exit(0);
}

const gpuWriteBuffer = device.createBuffer({
  mappedAtCreation: true,
  size: 4,
  usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
});
const arrayBuffer = gpuWriteBuffer.getMappedRange();

// Write bytes to buffer.
new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);

// Unmap buffer so that it can be used later for copy.
gpuWriteBuffer.unmap();

// Get a GPU buffer for reading in an unmapped state.
const gpuReadBuffer = device.createBuffer({
  size: 4,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
});

// Encode commands for copying buffer to buffer.
const copyEncoder = device.createCommandEncoder();
copyEncoder.copyBufferToBuffer(
  gpuWriteBuffer, /* source buffer */
  0,
  gpuReadBuffer, /* destination buffer */
  0, /* destination offset */
  4, /* size */
);

// Submit copy commands.
const copyCommands = copyEncoder.finish();
device.queue.submit([copyCommands]);

// Read buffer.
await gpuReadBuffer.mapAsync(GPUMapMode.READ);
const copyArrayBuffer = gpuReadBuffer.getMappedRange();
console.log(new Uint8Array(copyArrayBuffer));

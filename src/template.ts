import { DataFormat } from './types';

export const generateTemplate = (data: DataFormat, js: string) => {
    const head = `
    <script>
        var data = ${JSON.stringify(JSON.stringify(data))};
    </script>
    <script>
        ${js}
    </script>
    <style>
        line.link {
            fill: none;
            stroke: #666;
            stroke-width: 1.5px;
        }
    </style>
   `;
   const body = `
        <header>
            <button onclick="visualizer.default.onlyNodeEntry()">Entry nodes</button>
            <button onclick="visualizer.default.entryCrossNodes()">Cross nodes</button>
        </header>
        <svg id="visualizer" width="900" height="600"></svg>
    `;
   return `<html>
   <head>
    ${head}
   </head>
   <body>
    ${body}
   </body>
   </html>`;
}
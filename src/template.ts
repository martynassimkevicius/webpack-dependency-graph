import { DataFormat } from './types';

export const generateTemplate = (data: DataFormat, js: string, stream: (text: string) => void) => {
    stream(`<html>
    <head>
    <script>
    var data = {"nodes":[`);
    data.nodes.map((mapObj, index) => stream((index == 0 ? '' : ',') + JSON.stringify(mapObj)));
    stream('],"links":[');
    data.links.map((mapObj, index) => stream((index == 0 ? '' : ',') + JSON.stringify(mapObj)));
    stream(`]};
    </script>
    <script>
    ${js}
    </script>
    <style>
        line.link {
            fill: none;
            stroke: #000;
            stroke-width: 2px;
        }
        line.link.click {
            cursor: pointer;
        }
        line.link.click:hover {
            stroke-width: 4px;
        }
    </style>
    </head>`);
    stream(`
    <body>
        <header>
            <button onclick="visualizer.default.onlyNodeEntry()">Entry nodes</button>
            <button onclick="visualizer.default.entryCrossNodes()">Cross nodes</button>
        </header>
        <div id="visualizer" style="width: 100%; height: 100%;"></div>
   </body>
   </html>`);
}
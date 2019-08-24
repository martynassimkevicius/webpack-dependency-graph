import webpack from "webpack";
import { DataFormat } from './types';
import fs from 'fs';
import { generateTemplate } from "./template";
import jsText from "!!raw-loader!./../dist/graphVisualizer"; 

export class DependencyGraphWebpackPlugin implements webpack.Plugin {


    constructor(public opts = { prod: false, jsOutside: true }) {
    }

    processData(data: webpack.Stats.ToJsonOutput, callback: () => void) {
        if (!data.modules) {
            return;
        }
        const result = data.modules.reduce((results: DataFormat, moduleItem) => {
            if (moduleItem.name.indexOf('node_modules') >= 0 || moduleItem.name.indexOf('.ts') < 0)
                return results;
            results.nodes.push({ id: moduleItem.name, chunks: moduleItem.chunks, size: moduleItem.size, codeSource: moduleItem.source, issuerPath: moduleItem.issuerPath, isEntry: !moduleItem.issuerPath });
            moduleItem.reasons.map((reason) => {
                if (reason.moduleName != null && !(reason.moduleName.indexOf('node_modules') >= 0 || reason.moduleName.indexOf('.ts') < 0)) {
                    results.links.push({
                        source: moduleItem.name,
                        target: reason.moduleName,
                        type: reason.type,
                        userRequest: reason.userRequest,
                        loc: reason.loc
                    });
                }
            });
            return results;
        }, { nodes: [], links: [] });
        result.nodes = this.removeDuplicates(result.nodes, 'id');
        // result.links = this.removeDuplicatesByCoupleKeys(result.links, 'source', 'target');
        this.showDependencyGraph(result);
        callback();
    }

    showDependencyGraph(data: DataFormat) {
        //console.log(filename);
        const js = jsText; // fs.readFileSync(path.resolve(path.dirname(filename), 'graphVisualizer.js'));
        if (this.opts.jsOutside) {
            fs.writeFileSync('dependency_graph.html', generateTemplate(data, `
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'dependency_graph.js';
            document.getElementsByTagName('head')[0].appendChild(script);
            `));
            fs.writeFileSync('dependency_graph.js', js);
        } else {
            fs.writeFileSync('dependency_graph.html', generateTemplate(data, js));
        }
        
    }

    removeDuplicates<T extends TItem[], TItem extends Record<TKey, string | number>, TKey extends string>(myArr: T, prop: TKey) {
        const array = myArr.map(mapObj => mapObj[prop]);
        return myArr.filter((obj, pos) => {
            return array.indexOf(obj[prop]) === pos;
        });
    }

    removeDuplicatesByCoupleKeys<T extends TItem[], TItem extends Record<TKey | TKey2, string | number>, TKey extends string, TKey2 extends string>(
        myArr: T, prop: TKey, prop2: TKey2) {
        const array = myArr.map(mapObj => mapObj[prop]);
        const array2 = myArr.map(mapObj => mapObj[prop2]);
        return myArr.filter((obj, pos) => {
            return array.indexOf(obj[prop]) === pos && array2.indexOf(obj[prop2]) === pos;
        });
    }

    apply(compiler: webpack.Compiler) {
      // Specify the event hook to attach to
      compiler.hooks.afterEmit.tapAsync(
        'DependencyGraphWebpackPlugin',
        (compilation, done) => {
            const stats = compilation.getStats().toJson({
            maxModules: 99999,
            modules: true,
            entrypoints: true,
            reasons: true,
            chunks: true,
            source: true,
        }, true);
        this.processData(stats, done);
        }
      );
    }
  }

export interface TurboTask {
  name: string;
  dependsOn: string[];
  inputs: string[];
  outputs: string[];
}

export interface DependencyGraph {
  nodes: Map<string, TurboTask>;
  edges: Map<string, string[]>;
}

export class TurboDependencyGraph {
  private graph: DependencyGraph = { nodes: new Map(), edges: new Map() };

  addTask(task: TurboTask): void {
    this.graph.nodes.set(task.name, task);
    this.graph.edges.set(task.name, task.dependsOn);
  }

  getBuildOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visiting = new Set<string>();

    const dfs = (task: string) => {
      if (visited.has(task)) return;
      if (visiting.has(task)) throw new Error(`Circular dependency: ${task}`);
      visiting.add(task);
      
      const deps = this.graph.edges.get(task) || [];
      for (const dep of deps) {
        dfs(dep);
      }
      
      visiting.delete(task);
      visited.add(task);
      order.push(task);
    };

    for (const task of this.graph.nodes.keys()) {
      dfs(task);
    }

    return order;
  }

  getAffectedTasks(changedFiles: string[]): string[] {
    const affected = new Set<string>();
    for (const [name, task] of this.graph.nodes) {
      for (const file of changedFiles) {
        if (task.inputs.some(input => file.startsWith(input))) {
          affected.add(name);
          break;
        }
      }
    }
    return Array.from(affected);
  }

  getParallelGroups(): string[][] {
    const buildOrder = this.getBuildOrder();
    const groups: string[][] = [];
    const scheduled = new Set<string>();

    for (const task of buildOrder) {
      const deps = this.graph.edges.get(task) || [];
      if (deps.every(d => scheduled.has(d))) {
        const group = groups.find(g => g.every(t => {
          const tDeps = this.graph.edges.get(t) || [];
          return !tDeps.includes(task) && !(this.graph.edges.get(task) || []).includes(t);
        }));
        if (group) group.push(task);
        else groups.push([task]);
        scheduled.add(task);
      }
    }

    return groups;
  }
}

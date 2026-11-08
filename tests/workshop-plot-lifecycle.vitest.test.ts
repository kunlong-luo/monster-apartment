import {describe,it,expect} from 'vitest';
import {destroyWorkshopDisplayChildren} from '../v2/src/workshop-plot-lifecycle';

type FakeNode={
  children:FakeNode[];
  removeChildren:()=>FakeNode[];
  destroy:(...options:unknown[])=>void;
};

describe('R09.4 Pixi graphics context ownership on plot cleanup',()=>{
  it('destroys child nodes before parents with no explicit destroy options',()=>{
    const calls:string[]=[];
    const mock=(name:string,initial:FakeNode[]=[]):FakeNode=>{
      const node:FakeNode={
        children:initial,
        removeChildren:()=>node.children.splice(0),
        destroy:(...options:unknown[])=>{
          // Pixi automatically destroys a self-owned GraphicsContext only
          // when destroy() is invoked without explicit options.
          if(options.length)throw Error('Explicit options could preserve context');
          calls.push(name);
        },
      };
      return node;
    };
    const graphics=mock('graphics'),sprite=mock('sprite');
    const effects=mock('effects',[mock('effect-graphics')]);
    const plot=mock('plot',[graphics,sprite,effects]);
    const stage=mock('stage',[plot]);
    destroyWorkshopDisplayChildren(
      stage as unknown as Parameters<typeof destroyWorkshopDisplayChildren>[0]
    );
    expect(calls).toEqual([
      'graphics','sprite','effect-graphics','effects','plot',
    ]);
    expect(stage.children).toHaveLength(0);
    expect(plot.children).toHaveLength(0);
    expect(effects.children).toHaveLength(0);
  });
  it('does not touch independent siblings or destroy any shared textures',()=>{
    const calls:string[]=[];
    const make=(label:string):FakeNode=>({
      children:[],
      removeChildren:()=>[],
      destroy:(...args:unknown[])=>{
        expect(args).toHaveLength(0);
        calls.push(label);
      },
    });
    const reusableTexture={destroy:()=>{throw Error('Shared texture destroyed');}};
    const textureSprite=make('sprite');
    Object.assign(textureSprite,{texture:reusableTexture});
    const plot:FakeNode={
      children:[textureSprite],
      removeChildren:()=>plot.children.splice(0),
      destroy:()=>{throw Error('The plot container must remain alive');},
    };
    const sibling=make('sibling');
    destroyWorkshopDisplayChildren(
      plot as unknown as Parameters<typeof destroyWorkshopDisplayChildren>[0]
    );
    expect(calls).toEqual(['sprite']);
    expect(sibling.children).toHaveLength(0);
  });
});

import {
  Component as NgComponent,
  Directive as NgDirective,
  Pipe as NgPipe,
  NgModule,
  ViewContainerRef,
  ComponentFactoryResolver,
  Type,
  ModuleWithProviders,
  SchemaMetadata,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RouterModule } from '@angular/router';

export function Component(
  componentMetadata: NgComponent & {
    standalone: true;
    // TODO: tighten up the types
    imports?: Array<Type<any> | ModuleWithProviders<any>>;
    schemas?: Array<SchemaMetadata | any[]>;
  }
): ClassDecorator {
  //console.log(`Standalone @Component declared:`, componentMetadata);

  const ngComponentDecorator = NgComponent(componentMetadata);

  const exportedProviders = [];
  const processedImports =
    componentMetadata.imports?.map(
      (importable) => importable['module'] ?? importable
    ) ?? [];

  return function (componentClazz) {
    @NgModule({
      declarations: [[componentClazz]],
      // TODO: is it a good idea to include CommonModule by default?
      imports: [processedImports],
      exports: [[componentClazz]],
      // TODO: surprisingly the JIT compiler still requires entryComponents for ComponentFactoryResolver to work
      entryComponents: [[componentClazz]],
      schemas: componentMetadata.schemas,
    })
    class VirtualNgModule {}

    componentClazz['module'] = VirtualNgModule;

    return ngComponentDecorator(componentClazz);
  };
}

@Component({
  standalone: true,
  selector: 'app-lazy-c',
  template: `LAZY C`,
  imports: [RouterModule.forChild([{ path: '', component: LazyCComponent }])],
})
export class LazyCComponent {
  constructor() {}
}

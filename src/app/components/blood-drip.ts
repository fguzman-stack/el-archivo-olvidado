import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-blood-drip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="absolute top-0 left-0 right-0 pointer-events-none z-20 overflow-visible"
      [class.opacity-90]="accent()"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        class="w-full h-8 md:h-12 text-[#7a1f1a] drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)]"
      >
        <defs>
          <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3d0e0c" />
            <stop offset="60%" stop-color="#7a1f1a" />
            <stop offset="100%" stop-color="#a01a14" />
          </linearGradient>
        </defs>

        <!-- Irregular coagulated drip fringe -->
        <path
          d="M0,0 L1200,0 L1200,10 
             Q1150,14 1120,38 Q1110,48 1100,20 
             Q1050,12 1010,44 Q1000,56 990,16 
             Q920,10 880,32 Q870,42 860,14 
             Q780,12 740,50 Q730,62 720,18 
             Q640,10 610,35 Q600,45 590,14 
             Q510,12 470,48 Q460,58 450,16 
             Q380,10 350,28 Q340,38 330,12 
             Q260,12 220,52 Q210,64 200,22 
             Q140,10 110,34 Q100,44 90,14 
             Q40,10 0,22 Z"
          fill="url(#bloodGrad)"
        />

        <!-- Elongated viscous falling drops -->
        <circle cx="210" cy="54" r="3.2" fill="#a01a14" class="animate-pulse" />
        <circle cx="460" cy="52" r="2.8" fill="#a01a14" class="animate-pulse" />
        <circle cx="730" cy="56" r="3.5" fill="#a01a14" class="animate-pulse" />
        <circle cx="1000" cy="48" r="2.9" fill="#a01a14" class="animate-pulse" />
      </svg>
    </div>
  `,
})
export class BloodDrip {
  accent = input<boolean>(false);
}

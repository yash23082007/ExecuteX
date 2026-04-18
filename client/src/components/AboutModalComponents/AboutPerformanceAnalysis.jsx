import React from 'react';
import { Activity } from "lucide-react";

export function AboutPerformanceAnalysis() {
  return (
    <section className="about__section">
      <h2 className="about__heading"><span className="about__heading-num">04</span>Performance Analysis</h2>
      
      <div className="about__math-grid">
        <div className="math-card">
          <h3 className="math-card__title"><Activity size={13} /> Response Time Model</h3>
          <div className="math-card__formula font-mono">  
            T<sub>total</sub> = T<sub>staging</sub> + T<sub>boot</sub> + T<sub>compile</sub> + T<sub>exec</sub> + T<sub>cleanup</sub>
          </div>
          <table className="math-table">
            <thead>
              <tr><th>Component</th><th>Avg (ms)</th><th>&sigma; (ms)</th><th>P99 (ms)</th></tr>
            </thead>
            <tbody>
              <tr><td>File Staging</td><td>2.3</td><td>0.8</td><td>4.1</td></tr>
              <tr><td>Container Boot</td><td>185</td><td>42</td><td>310</td></tr>
              <tr><td>Cleanup & Destroy</td><td>45</td><td>12</td><td>89</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
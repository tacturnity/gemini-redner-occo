import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const defaultText = `# 3.5 | STATISTICAL MECHANICS

When dealing with a massive number of particles, like the electrons in a crystal, we are not interested in the behavior of each individual particle. Instead, we use **statistical mechanics** to describe the average or collective behavior of the entire system. Just as the pressure of a gas is the average result of countless atomic collisions, the electrical properties of a crystal are determined by the statistical behavior of its electrons.

## 3.5.1 Statistical Laws

To describe the statistical behavior of particles, we must first know the laws that govern how they are distributed among available energy states. There are three fundamental distribution laws:

*   **Maxwell-Boltzmann Distribution:**
    *   **Applies to:** Identical but **distinguishable** particles.
    *   **Key Feature:** There is no limit to the number of particles allowed in each energy state.
    *   **Example:** Molecules in a gas at low pressure can be modeled this way.

*   **Bose-Einstein Distribution:**
    *   **Applies to:** Identical and **indistinguishable** particles with integer spin (called **bosons**).
    *   **Key Feature:** There is no limit to the number of particles per quantum state.
    *   **Example:** Photons (particles of light) or black-body radiation.

*   **Fermi-Dirac Distribution:**
    *   **Applies to:** Identical and **indistinguishable** particles with half-integer spin (called **fermions**).
    *   **Key Feature:** Only **one** particle is permitted in each quantum state. This is a direct consequence of the **Pauli exclusion principle**.
    *   **Example:** **Electrons in a crystal obey this law.**

For all of these cases, the particles are assumed to be non-interacting.

## 3.5.2 The Fermi-Dirac Distribution

Our goal is to find the most probable distribution of electrons among the available energy levels and quantum states in a crystal.

**Counting the Number of Arrangements**
Let's consider a single energy level, $E_i$, which contains $g_i$ distinct quantum states. We want to place $N_i$ electrons into this level. Since electrons are indistinguishable fermions, we need to count the number of distinct ways this can be done, following the Pauli exclusion principle (one electron per state).

This is a classic problem in combinatorics. The number of ways to choose $N_i$ states to fill out of a total of $g_i$ available states is given by the combination formula:

$$W_i = \\frac{g_i!}{N_i! * (g_i - N_i)!} \\quad (3.77)$$

*   **$W_i$** is the number of independent ways of arranging the $N_i$ electrons in the $g_i$ states at energy level $i$.
*   The term **$g_i!$** in the numerator accounts for all possible arrangements if the particles were distinguishable.
*   The **$N_i!$** in the denominator corrects for the fact that the electrons are indistinguishable (swapping two electrons does not create a new arrangement).
*   The **$(g_i - N_i)!$** term accounts for the permutations of the empty states.

**Figure 3.28 | The *i*th energy level with *g_i* quantum states.**
*   **Description:** A diagram showing a horizontal line labeled "*i*th energy level". Above the line are boxes labeled "Quantum states", numbered 1, 2, 3, etc. Some boxes contain a black dot, representing a filled state (an electron).

---
**EXAMPLE 3.5**
*   **Objective:** Determine the possible number of ways of realizing a particular distribution for: (a) $g_i = 10$, $N_i = 10$ and (b) $g_i = 10$, $N_i = 9$.
*   **Solution:**
    *   **(a)** $W_i = 10! / (10! * (10-10)!) = 10! / (10! * 0!) = 1$. (Since $0! = 1$). There is only one way to place 10 electrons in 10 states: fill all of them.
    *   **(b)** $W_i = 10! / (9! * (10-9)!) = 10! / (9! * 1!) = (10 * 9!) / 9! = 10$. There are 10 ways to place 9 electrons in 10 states: leave any one of the 10 states empty.

---
**EXERCISE PROBLEM**
**EX3.5** Determine the possible number of ways of realizing a particular distribution if $g_i = 10$ and $N_i = 8$. (Ans. 45 ways)

---
**The Most Probable Distribution**
To find the distribution of electrons across *all* energy levels in the crystal, we find the product of the individual $W_i$ terms for each level:

$$W = \\prod_i W_i = \\prod_i \\left[ \\frac{g_i!}{N_i! * (g_i - N_i)!} \\right] \\quad (3.78)$$

The most probable distribution of electrons is the one that maximizes this total number of arrangements, $W$, subject to two constraints: the total number of electrons is constant, and the total energy of the system is constant. The mathematical process of maximizing $W$ leads to the **Fermi-Dirac distribution function**.

The final result of this statistical analysis gives us the **Fermi-Dirac distribution function, $f_F(E)$**:

$$f_F(E) = \\frac{1}{1 + \\exp\\left(\\frac{E - E_F}{kT}\\right)} \\quad (3.79)$$

*   **$f_F(E)$:** This is the **probability** that an available quantum state at a specific energy $E$ will be occupied by an electron.
*   **$E_F$:** This is a crucial energy reference level called the **Fermi energy** or **Fermi level**.
*   **$k$:** Boltzmann's constant.
*   **$T$:** Absolute temperature in Kelvin.

The actual number density of electrons, $N(E)$, at a given energy is the product of the density of available states, $g(E)$, and the probability that those states are occupied, $f_F(E)$.

## 3.5.3 The Distribution Function and the Fermi Energy

Let's analyze the behavior of the Fermi function to understand its meaning.

**Case 1: At Absolute Zero (T = 0 K)**
We examine the exponential term, $\\exp((E - E_F)/kT)$, as T approaches 0.
*   **If $E < E_F$:** The exponent $(E - E_F)$ is negative. As $T \\rightarrow 0$, the exponent approaches $-\\infty$. Since $e^{-\\infty} = 0$, the function becomes:
    $f_F(E) = 1 / (1 + 0) = 1$
*   **If $E > E_F$:** The exponent is positive. As $T \\rightarrow 0$, the exponent approaches $+\\infty$. Since $e^{+\\infty} = \\infty$, the function becomes:
    $f_F(E) = 1 / (1 + \\infty) = 0$

**Conclusion for T = 0 K:**
At absolute zero, the Fermi-Dirac distribution is a simple step function.
*   All energy states with energy **below** the Fermi level ($E < E_F$) are **completely filled** (probability = 1).
*   All energy states with energy **above** the Fermi level ($E > E_F$) are **completely empty** (probability = 0).
*   Therefore, at T=0 K, the **Fermi energy ($E_F$)** is the maximum energy that any electron possesses.

**Figure 3.29 | The Fermi probability function versus energy for T = 0 K.**
*   **Description:** A plot of $f_F(E)$ vs. $E$. The function is a horizontal line at 1.0 for $E < E_F$, and it drops vertically to 0 at $E = E_F$, remaining at 0 for all $E > E_F$.

**Figure 3.30 | Discrete energy states and quantum states for a particular system at T = 0 K.**
*   **Description:** A diagram showing discrete energy levels $E_1$, $E_2$, $E_3$, etc. Each level has multiple quantum states (represented by dashes). At T=0K, all states in levels $E_1$ and $E_2$ are filled with electrons (represented by 'e's). All states in $E_3$ and above are empty. The Fermi level $E_F$ lies between the highest filled level ($E_2$) and the lowest empty level ($E_3$).

**Figure 3.31 | Density of quantum states and electrons in a continuous system at T = 0 K.**
*   **Description:** A plot combining the density of states $g(E)$ with the Fermi function. The curve for $g(E)$ is shown. The area under the curve up to $E_F$ is shaded, representing the density of filled states, $N(E)$.

**Case 2: At Temperatures Above Absolute Zero (T > 0 K)**
When the temperature increases, electrons gain thermal energy. Some electrons with energies just below $E_F$ are excited to empty states with energies just above $E_F$.
*   **The "Smearing" Effect:** The sharp step function at T=0 K "smears out" into a smooth curve. The transition from fully occupied to fully empty now occurs over an energy range of a few $kT$ centered around the Fermi level.
*   **The Meaning of $E_F$ at T > 0 K:** Let's look at the special case where $E = E_F$. The exponent becomes $(E_F - E_F)/kT = 0$. Since $e^0 = 1$, the function is:
    $f_F(E=E_F) = 1 / (1 + 1) = 1/2$
*   **Conclusion for T > 0 K:** The **Fermi energy ($E_F$)** is the energy level at which the probability of a state being occupied by an electron is exactly **1/2 or 50%**.

**Figure 3.33 | The Fermi probability function versus energy for different temperatures.**
*   **Description:** A plot showing $f_F(E)$ vs. $E$ for T=0 K (sharp step), T=$T_1$ (a smooth curve), and T=$T_2$ (an even more spread-out curve, where $T_2 > T_1$). All three curves pass through the point ($E_F$, 1/2).

---
**EXAMPLE 3.6**
*   **Objective:** Calculate the probability that an energy state above $E_F$ is occupied. Let T=300 K. Determine the probability that an energy level $3kT$ above the Fermi energy is occupied by an electron.
*   **Solution:**
    $f_F(E) = 1 / (1 + \\exp((E - E_F)/kT)) = 1 / (1 + \\exp(3kT/kT)) = 1 / (1 + e^3)$
    $f_F(E) = 1 / (1 + 20.09) = 0.0474 = 4.74\\%$
*   **Comment:** The probability of finding an electron in a state significantly above $E_F$ is quite small.

**EXAMPLE 3.7**
*   **Objective:** Determine the temperature at which there is a 1 percent probability that an energy state is empty. Assume $E_F$ for a material is 6.25 eV and the electrons in this material follow the Fermi-Dirac distribution. Calculate the temperature at which there is a 1 percent probability that a state 0.30 eV below the Fermi level will not contain an electron.
*   **Solution:** The probability that a state is empty is $1 - f_F(E)$.
    $1 - f_F(E) = 1 - [1 / (1 + \\exp((E - E_F)/kT))] = 0.01$
    Solving for $kT$ with $E - E_F = -0.30$ eV:
    $kT = 0.06529$ eV.
    $T = 0.06529 / (8.62 \\times 10^{-5} \\text{ eV/K}) = 756$ K.

---
**EXERCISE PROBLEM**
**EX3.6** Assume the Fermi energy level is 0.30 eV below the conduction band energy $E_c$. Assume T=300 K. Determine the probability of a state being occupied by an electron at $E = E_c + kT/4$. (b) Repeat part (a) for an energy state at $E = E_c + kT$.
(Ans. (a) $4.1 \\times 10^{-6}$, (b) $1.9 \\times 10^{-6}$)

**EX3.7** Assume that $E_F$ is 0.3 eV below $E_c$. Determine the temperature at which the probability of an electron occupying an energy state at $E = E_c$ is $8 \\times 10^{-6}$.
(Ans. T = 260 K)
`;

function App() {
  const [text, setText] = useState(defaultText);
  const [isSourceVisible, setSourceVisible] = useState(true);
  const containerRef = useRef(null);
  const outputPanelRef = useRef(null);
  const [columnClass, setColumnClass] = useState('cols-1');

  // Handle resizing the panels using CSS Grid
  useEffect(() => {
    const resizer = document.querySelector('.resizer');
    const container = containerRef.current;
    if (!resizer || !container) return;

    const handleMouseMove = (e) => {
      const newLeftWidth = e.clientX;
      if (newLeftWidth > 100 && newLeftWidth < window.innerWidth - 100) {
        container.style.gridTemplateColumns = `${newLeftWidth}px 5px 1fr`;
      }
    };
    
    const handleMouseUp = () => document.removeEventListener('mousemove', handleMouseMove);
    const handleMouseDown = () => document.addEventListener('mousemove', handleMouseMove);
    
    resizer.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizer.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Dynamic Column Logic
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width > 1500) setColumnClass('cols-4');
        else if (width > 1100) setColumnClass('cols-3');
        else if (width > 700) setColumnClass('cols-2');
        else setColumnClass('cols-1');
      }
    });

    if (outputPanelRef.current) {
      observer.observe(outputPanelRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div 
        ref={containerRef}
        className={`app-container ${isSourceVisible ? '' : 'source-hidden'}`}
      >
        <div className="panel input-panel">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your Markdown here..."
          />
        </div>
        <div className="resizer"></div>
        <div className="panel output-panel" ref={outputPanelRef}>
          <div className={`content-wrapper ${columnClass}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <div id="toggle-source" onClick={() => setSourceVisible(!isSourceVisible)}>
        {isSourceVisible ? '—' : '+'}
      </div>
    </>
  );
}

export default App;
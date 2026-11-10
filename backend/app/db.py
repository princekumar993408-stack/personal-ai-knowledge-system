"""
SQLite Database Layer for CortexPKM
"""

import sqlite3
import os
import re
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "cortex_knowledge.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Notes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        word_count INTEGER NOT NULL
    );
    """)

    # Links table (source_note_id -> target_title)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_note_id INTEGER NOT NULL,
        target_title TEXT NOT NULL,
        FOREIGN KEY (source_note_id) REFERENCES notes(id) ON DELETE CASCADE
    );
    """)

    # Check if empty, seed default notes
    cursor.execute("SELECT COUNT(*) FROM notes;")
    if cursor.fetchone()[0] == 0:
        seed_default_knowledge(cursor)

    conn.commit()
    conn.close()

def seed_default_knowledge(cursor):
    now = datetime.utcnow().isoformat() + "Z"

    default_notes = [
        (
            "Retrieval-Augmented Generation (RAG) Architecture",
            """# Retrieval-Augmented Generation (RAG) Architecture

Retrieval-Augmented Generation optimizes Large Language Model generation by dynamically querying an external non-parametric memory index before synthesis.

## Key Subsystems
1. **Document Ingestion & Chunking**: Recursive character and semantic boundary splitting. Overlapping chunks (e.g., 500 tokens with 50-token stride) preserve contextual continuity.
2. **Dense Vector Embeddings**: Transforming text chunks into high-dimensional latent space representations using embedding models or normalized TF-IDF projections.
3. **Similarity Search**: Cosine distance computation via nearest-neighbor algorithms (such as FAISS or pure NumPy dot product matrix operations).
4. **Context Injection & Prompt Engineering**: Injecting retrieved top-k context snippets into the model prompt alongside strict citation instructions.

See related implementations in [[AI Research Assistant Platform]] and [[Deep Learning & Neural Architectures with PyTorch]].""",
            "AI, RAG, NLP, Python, Vector Search",
            now,
            now,
            124
        ),
        (
            "Tropical Cyclone Intensity & Dvorak Physics",
            """# Tropical Cyclone Intensity & Dvorak Physics

Satellite-based tropical cyclone analysis relies on multi-spectral thermal infrared (TIR) brightness temperature patterns and empirical aerodynamic relationships.

## The Atkinson-Holliday Empirical Relation
In the North Indian Ocean basin (Bay of Bengal and Arabian Sea), minimum central pressure is physically coupled to maximum sustained 3-minute surface winds ($V_{max}$ in knots) via the Atkinson-Holliday equation:
$$P_{min} = 1010 - \\left(\\frac{V_{max}}{4.417}\\right)^{1.33}$$

## Spatial Attention & Eye Boundary Detection
Convolutional neural networks trained on INSAT-3D thermal IR (10.8 µm) utilize spatial self-attention to isolate the warm core eye temperature deficit against colder cloud tops (-75°C to -85°C).

## Beta-Drift Steering Dynamics
Coriolis planetary vorticity gradients induce a non-linear poleward and westward beta-drift velocity, leading to characteristic northeastward recurvature paths across the Bay of Bengal coastline.

Cross-reference: [[Deep Learning & Neural Architectures with PyTorch]] and [[Personal AI Knowledge Management System]].""",
            "Meteorology, PyTorch, Computer Vision, Physics, Cyclone",
            now,
            now,
            142
        ),
        (
            "Microbial Fuel Cell (MFC) Bio-Electrochemical Telemetry",
            """# Microbial Fuel Cell (MFC) Bio-Electrochemical Telemetry

Microbial Fuel Cells (MFCs) leverage exoelectrogenic bacterial respiration (*Geobacter sulfurreducens*) to harvest electricity directly from wastewater organics.

## Three-Regime Polarization Model
Cell operating potential decreases with drawn current density according to three overpotentials:
$$V_{cell} = V_{oc} - \\eta_{act} - \\eta_{ohm} - \\eta_{conc}$$
- **Activation Loss (\\eta_{act})**: Butler-Volmer electron transfer barrier across outer-membrane bacterial cytochromes.
- **Ohmic Loss (\\eta_{ohm})**: Linear potential drop governed by internal resistance: $V = V_{oc} - I \\cdot R_{int}$.
- **Mass Transport (\\eta_{conc})**: Substrate and proton diffusion ceiling at high currents.

## Maximum Power Transfer & Jacobi's Law
Maximum power transfer occurs when external circuit load matches the internal cell resistance: $R_{ext} = R_{int}$.

## Hardware Telemetry Node
Continuous micro-scale sampling is achieved using an ESP32 microcontroller with a 16-bit ADS1115 differential ADC and precision shunt resistor.

Connected to: [[ESP32 Embedded Systems & MQTT Telemetry]].""",
            "IoT, Clean Energy, ESP32, Electrochemistry, Hardware",
            now,
            now,
            140
        ),
        (
            "Applicant Tracking System (ATS) Semantic Parsing",
            """# Applicant Tracking System (ATS) Semantic Parsing

Modern enterprise ATS platforms (Workday, Greenhouse, Lever) index resumes by extracting textual entities, matching skills against Job Descriptions, and evaluating semantic relevance.

## Key Evaluation Pillars
1. **TF-IDF Semantic Matching**: Computing cosine angles between normalized n-gram document vectors to quantify topical alignment without keyword stuffing.
2. **Taxonomy Skill Gap Auditing**: Categorizing candidate capabilities into Core Programming Languages, AI/ML, Web, Cloud, and Embedded Systems.
3. **The Google XYZ Formula**:
   $$\\text{Accomplished [X] as measured by [Y], by doing [Z]}$$
   Replacing passive phrases ('responsible for') with quantifiable impact metrics and active engineering power verbs.
4. **Structural Parseability**: Eliminating complex multi-column floating text frames that trigger parser misalignments.

Cross-links: [[Retrieval-Augmented Generation (RAG) Architecture]].""",
            "NLP, Career Tech, Algorithms, Python, ATS",
            now,
            now,
            116
        ),
        (
            "ESP32 Embedded Systems & MQTT Telemetry",
            """# ESP32 Embedded Systems & MQTT Telemetry

The Espressif ESP32-WROOM-32 provides a dual-core 240 MHz Tensilica Xtensa architecture with integrated 802.11 b/g/n Wi-Fi and Bluetooth LE.

## Firmware Architecture
- **FreeRTOS Multitasking**: Core 0 dedicated to Wi-Fi and MQTT network transport; Core 1 dedicated to high-precision I2C/SPI sensor acquisition.
- **Precision Analog Sampling**: Utilizing external ADS1115 16-bit differential ADCs to overcome internal ESP32 SAR ADC non-linearity.
- **Offline Flash Ring-Buffering**: Writing timestamped telemetry to SPIFFS/LittleFS circular logs during network outages and flushing on reconnection with QoS 1.

Used in: [[Microbial Fuel Cell (MFC) Bio-Electrochemical Telemetry]].""",
            "Embedded, C++, Hardware, MQTT, IoT, ESP32",
            now,
            now,
            105
        ),
        (
            "Deep Learning & Neural Architectures with PyTorch",
            """# Deep Learning & Neural Architectures with PyTorch

PyTorch enables dynamic computational graphs, seamless GPU/CPU tensor execution, and custom autograd loss functions.

## Key Design Patterns
- **Spatial Self-Attention**: Emphasizing salient localized features while dampening background noise in satellite or spatial tensors.
- **Physics-Informed Loss Functions**: Enforcing thermodynamic or kinematic equilibrium constraints:
  $$\\mathcal{L}_{total} = \\mathcal{L}_{task} + \\lambda \\cdot \\mathcal{L}_{physics}$$
- **Modular Multi-Task Heads**: Decoupling shared convolutional feature extractors into simultaneous classification and regression pathways.

Related concepts: [[Tropical Cyclone Intensity & Dvorak Physics]] and [[Retrieval-Augmented Generation (RAG) Architecture]].""",
            "AI, Deep Learning, PyTorch, Mathematics, CNN",
            now,
            now,
            86
        )
    ]

    for title, content, tags, cr_at, up_at, wc in default_notes:
        cursor.execute("""
        INSERT INTO notes (title, content, tags, created_at, updated_at, word_count)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (title, content, tags, cr_at, up_at, wc))
        note_id = cursor.lastrowid

        # Extract wikilinks [[Target Title]]
        links = re.findall(r"\[\[(.*?)\]\]", content)
        for link in links:
            cursor.execute("""
            INSERT INTO links (source_note_id, target_title)
            VALUES (?, ?);
            """, (note_id, link.strip()))

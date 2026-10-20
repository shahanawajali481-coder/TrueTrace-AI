"""
Base Analyzer Interface for TrueTrace AI
All analyzers implement this contract to produce uniform, auditable evidence.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from datetime import datetime, timezone

class BaseAnalyzer(ABC):
    @abstractmethod
    def analyze(self, identifier: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Executes permitted checks on the given identifier.
        Returns a list of structured evidence dictionaries.
        """
        pass

    @abstractmethod
    def mask_identifier(self, identifier: str) -> str:
        """
        Safely masks the identifier for privacy-conscious display.
        """
        pass

    def create_evidence(
        self,
        check_id: str,
        name: str,
        status: str,  # CONFIRMED, SUSPICIOUS, INFO, UNAVAILABLE, FAILED
        finding: str,
        source: str,
        reliability: float = 1.0,
        risk_contribution: int = 0,
        limitations: str = None,
        details: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Standardized helper to construct an evidence dictionary."""
        return {
            "check_id": check_id,
            "name": name,
            "status": status,
            "finding": finding,
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "reliability": reliability,
            "risk_contribution": risk_contribution,
            "limitations": limitations,
            "details": details or {},
        }
